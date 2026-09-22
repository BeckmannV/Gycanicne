<?php
/**
 * backend/fipe.php
 * Proxy da API FIPE v2 (https://fipe.parallelum.com.br/api/v2) com cache local
 * e suporte a token opcional via .env (FIPE_API_TOKEN).
 *
 * Endpoints:
 *   GET backend/fipe.php?recurso=marcas
 *   GET backend/fipe.php?recurso=modelos&marca=59
 *   GET backend/fipe.php?recurso=anos&marca=59&modelo=5940
 *   GET backend/fipe.php?recurso=veiculo&marca=59&modelo=5940&ano=2014-3
 */
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}

// --- .env (opcional) ------------------------------------------------
$env = [];
$envFile = dirname(__DIR__) . '/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linha) {
        $linha = trim($linha);
        if ($linha === '' || str_starts_with($linha, '#') || !str_contains($linha, '=')) continue;
        [$chave, $valor] = explode('=', $linha, 2);
        $env[trim($chave)] = trim($valor);
    }
}
$token = $env['FIPE_API_TOKEN'] ?? getenv('FIPE_API_TOKEN') ?: '';

function fipeRequisitar(string $url, string $token = ''): array {
    $headers = ['Accept: application/json'];
    if ($token !== '') {
        $headers[] = 'X-Subscription-Token: ' . $token;
    }
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERAGENT => 'Gycanic/1.0 (academico local)',
        CURLOPT_HTTPHEADER => $headers,
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $status !== 200) {
        return ['ok' => false, 'status' => $status];
    }
    $json = json_decode($body, true);
    return ['ok' => true, 'dados' => $json];
}

// --- Cache em disco (JSON por recurso, com TTL) ----------------------
$cacheDir = __DIR__ . '/fipe_cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0777, true);
}
$ttlPadrao = 86400; // 1 dia

function fipeCacheLer(string $chave, int $ttl): ?array {
    $arq = __DIR__ . '/fipe_cache/' . $chave . '.json';
    if (!is_file($arq)) return null;
    if (time() - filemtime($arq) > $ttl) return null;
    $dados = json_decode(file_get_contents($arq), true);
    return is_array($dados) ? $dados : null;
}

function fipeCacheGravar(string $chave, array $dados): void {
    file_put_contents(
        __DIR__ . '/fipe_cache/' . $chave . '.json',
        json_encode($dados, JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

// --- Roteamento -------------------------------------------------------
$recurso = $_GET['recurso'] ?? '';
$marca = isset($_GET['marca']) ? (int) $_GET['marca'] : 0;
$modelo = isset($_GET['modelo']) ? (int) $_GET['modelo'] : 0;
$ano = isset($_GET['ano']) ? trim($_GET['ano']) : '';

$urlBase = 'https://fipe.parallelum.com.br/api/v2/cars';

if ($recurso === 'marcas') {
    $cache = fipeCacheLer('marcas', 7 * $ttlPadrao); // semanal
    if ($cache !== null) {
        echo json_encode($cache);
        exit;
    }
    $res = fipeRequisitar($urlBase . '/brands', $token);
    if (!$res['ok']) {
        http_response_code(502);
        echo json_encode(['erro' => 'catálogo_indisponivel']);
        exit;
    }
    $marcas = array_values(array_map(function ($m) {
        return ['id' => (int) $m['code'], 'nome' => $m['name']];
    }, $res['dados']));
    sort($marcas);
    fipeCacheGravar('marcas', $marcas);
    echo json_encode($marcas);
    exit;
}

if ($recurso === 'modelos') {
    if ($marca <= 0) {
        http_response_code(400);
        echo json_encode(['erro' => 'marca_invalida']);
        exit;
    }
    $chave = 'modelos_' . $marca;
    $cache = fipeCacheLer($chave, 7 * $ttlPadrao); // semanal
    if ($cache !== null) {
        echo json_encode($cache);
        exit;
    }
    $res = fipeRequisitar($urlBase . '/brands/' . $marca . '/models', $token);
    if (!$res['ok']) {
        http_response_code(502);
        echo json_encode(['erro' => 'catálogo_indisponivel']);
        exit;
    }
    $modelos = array_values(array_map(function ($m) {
        return ['id' => (int) $m['code'], 'nome' => $m['name']];
    }, $res['dados']));
    fipeCacheGravar($chave, $modelos);
    echo json_encode($modelos);
    exit;
}

if ($recurso === 'anos') {
    if ($marca <= 0 || $modelo <= 0) {
        http_response_code(400);
        echo json_encode(['erro' => 'parametros_invalidos']);
        exit;
    }
    $chave = 'anos_' . $marca . '_' . $modelo;
    $cache = fipeCacheLer($chave, $ttlPadrao);
    if ($cache !== null) {
        echo json_encode($cache);
        exit;
    }
    $res = fipeRequisitar($urlBase . '/brands/' . $marca . '/models/' . $modelo . '/years', $token);
    if (!$res['ok']) {
        http_response_code(502);
        echo json_encode(['erro' => 'catálogo_indisponivel']);
        exit;
    }
    $anos = array_values(array_map(function ($a) {
        return ['id' => $a['code'], 'nome' => $a['name']];
    }, $res['dados']));
    fipeCacheGravar($chave, $anos);
    echo json_encode($anos);
    exit;
}

if ($recurso === 'veiculo') {
    if ($marca <= 0 || $modelo <= 0 || $ano === '') {
        http_response_code(400);
        echo json_encode(['erro' => 'parametros_invalidos']);
        exit;
    }
    $chave = 'veiculo_' . $marca . '_' . $modelo . '_' . preg_replace('/[^a-z0-9-]/i', '', $ano);
    $cache = fipeCacheLer($chave, $ttlPadrao);
    if ($cache !== null) {
        echo json_encode($cache);
        exit;
    }
    $res = fipeRequisitar($urlBase . '/brands/' . $marca . '/models/' . $modelo . '/years/' . rawurlencode($ano), $token);
    if (!$res['ok']) {
        http_response_code(502);
        echo json_encode(['erro' => 'catálogo_indisponivel']);
        exit;
    }
    $v = $res['dados'];
    $saida = [
        'marca' => $v['brand'] ?? '',
        'modelo' => $v['model'] ?? '',
        'ano' => $v['modelYear'] ?? '',
        'combustivel' => $v['fuel'] ?? '',
        'combustivel_sigla' => $v['fuelAcronym'] ?? '',
        'preco' => $v['price'] ?? '',
        'codigo_fipe' => $v['codeFipe'] ?? '',
        'referencia' => $v['referenceMonth'] ?? '',
    ];
    fipeCacheGravar($chave, $saida);
    echo json_encode($saida);
    exit;
}

http_response_code(400);
echo json_encode(['erro' => 'recurso_invalido']);
