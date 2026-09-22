<?php
// Catálogo de veículos. Com ?q= busca localmente no índice (marca + modelo)
// gerado por build-catalogo.php. Sem ?q=, faz proxy da API pública da FIPE.
//   GET api.php?acao=veiculos&q=polo              → sugestões de marca+modelo
//   GET api.php?acao=veiculos                      → marcas (FIPE)
//   GET api.php?acao=veiculos&marca=59             → modelos da marca (FIPE)
//   GET api.php?acao=veiculos&marca=59&modelo=5585 → versões/anos (FIPE)
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

// --- Busca textual no índice local ---
if (isset($_GET['q']) && trim($_GET['q']) !== '') {
    $q = mb_strtolower(trim($_GET['q']), 'UTF-8');
    $cache = __DIR__ . '/catalogo_cache.json';
    if (!is_file($cache)) {
        echo json_encode([]);
        exit;
    }
    $idx = json_decode(file_get_contents($cache), true);
    if (!is_array($idx)) {
        echo json_encode([]);
        exit;
    }
    // Divide a busca em termos e exige que TODOS apareçam na chave
    // (em qualquer ordem). Ex.: "suzuki vitara" casa com
    // "Suzuki - Grand Vitara 1.6", "Vitara Brezza (Suzuki)" etc.
    $termos = preg_split('/\s+/', $q, -1, PREG_SPLIT_NO_EMPTY);
    $resultados = [];
    foreach ($idx as $item) {
        $chave = mb_strtolower($item['chave'], 'UTF-8');
        $casa = true;
        foreach ($termos as $termo) {
            if (mb_strpos($chave, $termo) === false) {
                $casa = false;
                break;
            }
        }
        if (!$casa) continue;
        $resultados[] = [
            'id' => $item['marca_id'] . '-' . $item['modelo_id'],
            'nome' => $item['modelo'],
            'marca' => $item['marca'],
            'marca_id' => $item['marca_id'],
            'modelo_id' => $item['modelo_id'],
        ];
        if (count($resultados) >= 12) break;
    }
    echo json_encode($resultados);
    exit;
}

// --- Foto do veículo via Wikimedia Commons (cache local) ---
if (isset($_GET['foto']) && trim($_GET['foto']) !== '') {
    $texto = trim($_GET['foto']);
    $chaveCache = mb_strtolower(preg_replace('/[^a-z0-9]+/i', '', $texto), 'UTF-8');
    if ($chaveCache === '') {
        echo json_encode(['url' => null]);
        exit;
    }
    $cacheArq = __DIR__ . '/fotos_cache.json';
    $cache = is_file($cacheArq) ? json_decode(file_get_contents($cacheArq), true) : [];
    if (!is_array($cache)) $cache = [];
    if (array_key_exists($chaveCache, $cache)) {
        echo json_encode(['url' => $cache[$chaveCache]]);
        exit;
    }
    // Deriva termos de busca enxutos a partir do texto da OS:
    //  - t1: texto completo (normalizado, sem parênteses)
    //  - t2: marca + núcleo do modelo (sem ano/versão/motor etc.)
    //  - t3: marca + primeira palavra do modelo
    // Isso evita que "VW - VolksWagen Gol (novo) 1.0 Mi Total Flex 8V 2p"
    // falhe na busca por excesso de termos.
    $ignorar = ['2p','3p','4p','5p','8v','16v','1.0','1.4','1.6','1.8','2.0','2.5',
        '3.8','4x2','4x4','tb','tdi','cd','cs','ls','lt','mi','flex','total','novo',
        'aut','mec','diesel','gasolina','e6','esc','turbo','gli','gts','gt','ed',
        'special','gold','arg','unica','serie','ano','fabricado','diesel'];
    $textoLimpo = trim(str_replace(['(', ')', '-', '/'], ' ', $texto));
    $palavrasBrutas = preg_split('/\s+/', mb_strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $textoLimpo), 'UTF-8'));
    $nucleo = [];
    foreach ($palavrasBrutas as $p) {
        if (strlen($p) < 2) continue;
        if (in_array($p, $ignorar, true)) continue;
        if (preg_match('/^(19|20)\d{2}$/', $p)) continue;
        $nucleo[] = $p;
    }
    $termos = [$texto];
    if (count($nucleo) > 1) {
        $termos[] = ucfirst(implode(' ', $nucleo));
    }
    if (count($nucleo) > 2) {
        $termos[] = ucfirst(implode(' ', array_slice($nucleo, 0, 2)));
    }
    $termos = array_values(array_unique($termos));
    // Palavras da marca+modelo (sem acento) para pontuar títulos
    $palavras = array_unique(array_filter(
        preg_split('/[^a-z0-9]+/', strtolower(iconv('UTF-8', 'ASCII//TRANSLIT', $texto))),
        function ($p) { return strlen($p) >= 3; }
    ));
    $marcas = ['volkswagen', 'fiat', 'chevrolet', 'ford', 'toyota', 'honda',
        'hyundai', 'renault', 'jeep', 'nissan', 'peugeot', 'citroen',
        'mitsubishi', 'suzuki', 'kia', 'bmw', 'mercedes', 'audi', 'volvo',
        'subaru', 'mazda', 'chery', 'changan', 'gwm', 'gm', 'vw'];
    $rejeita = ['interior', 'engine', 'motor', 'dashboard', 'cockpit', 'logo',
        'badge', 'emblem', 'diagrama', 'schema', 'fuse', 'trunk', 'wheel',
        'tire', 'drawing', 'manual', 'cutaway', 'exploded'];
    $aceita = ['front', 'frente', 'lateral', 'side', 'rear', 'traseira', 'exterior'];
    $melhor = null;
    $melhorScore = -1;
    foreach ($termos as $t) {
        $api = 'https://commons.wikimedia.org/w/api.php?action=query'
            . '&generator=search&gsrsearch=' . rawurlencode($t)
            . '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url'
            . '&iiurlwidth=800&format=json&origin=*';
        $ch = curl_init($api);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_USERAGENT => 'Gycanic/1.0 (contato: site)',
        ]);
        $body = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body === false || $status !== 200) continue;
        $json = json_decode($body, true);
        if (!isset($json['query']['pages'])) continue;
        foreach ($json['query']['pages'] as $pagina) {
            $ii = isset($pagina['imageinfo'][0]) ? $pagina['imageinfo'][0] : null;
            if (!$ii || !isset($ii['thumburl'])) continue;
            $titulo = isset($pagina['title']) ? $pagina['title'] : '';
            $nomeArq = strtolower($titulo);
            if (preg_match('/\.(svg|pdf|ogv|webm|tif|tiff)$/', $nomeArq)) continue;
            $ruim = false;
            foreach ($rejeita as $r) {
                if (strpos($nomeArq, $r) !== false) { $ruim = true; break; }
            }
            if ($ruim) continue;
            $cand = explode('?', $ii['thumburl'])[0];
            if (!filter_var($cand, FILTER_VALIDATE_URL)) continue;
            // Pontua: palavras da marca/modelo no título (+2 cada) e ângulo (+3)
            $score = 0;
            $palavrasJuntas = implode(' ', $palavras);
            foreach ($palavras as $p) {
                if (strpos($nomeArq, $p) !== false) $score += 2;
            }
            foreach ($aceita as $a) {
                if (strpos($nomeArq, $a) !== false) { $score += 3; break; }
            }
            // Penaliza se o título menciona uma marca DIFERENTE da buscada
            foreach ($marcas as $m) {
                if (strpos($nomeArq, $m) !== false && strpos($palavrasJuntas, $m) === false) {
                    $score -= 4;
                }
            }
            if ($score > $melhorScore) {
                $melhorScore = $score;
                $melhor = $cand;
            }
        }
        if ($melhorScore >= 4) break; // bom resultado com esta busca
    }
    $url = $melhor;
    // Fallback local: placeholder do projeto quando não há foto na Commons.
    if ($url === null) {
        $url = '../public/cars/placeholder.svg';
    }
    // Só grava no cache URLs válidas (null não é cacheado: modelos sem foto
    // são re-tentados nas próximas chamadas, já que a Commons cresce sempre).
    if ($url !== null && $url !== '../public/cars/placeholder.svg') {
        $cache[$chaveCache] = $url;
        file_put_contents($cacheArq, json_encode($cache));
    }
    echo json_encode(['url' => $url]);
    exit;
}

$base = 'https://parallelum.com.br/fipe/api/v1/carros';
$marca = isset($_GET['marca']) ? (int) $_GET['marca'] : 0;
$modelo = isset($_GET['modelo']) ? (int) $_GET['modelo'] : 0;

if ($marca > 0 && $modelo > 0) {
    $url = "$base/marcas/$marca/modelos/$modelo/anos";
} elseif ($marca > 0) {
    $url = "$base/marcas/$marca/modelos";
} else {
    $url = "$base/marcas";
}

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 6,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_USERAGENT => 'Gycanic/1.0',
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);
$body = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($body === false || $status !== 200) {
    http_response_code(502);
    echo json_encode(['erro' => 'Catálogo indisponível no momento. Tente novamente.']);
    exit;
}

$dados = json_decode($body, true);
if ($marca > 0 && $modelo === 0 && isset($dados['modelos'])) {
    $dados = $dados['modelos'];
}
if (!is_array($dados)) {
    echo json_encode([]);
    exit;
}

$saida = array_map(function ($item) {
    return ['id' => $item['codigo'], 'nome' => $item['nome']];
}, $dados);

echo json_encode($saida);