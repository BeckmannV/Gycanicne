<?php
/**
 * Gera o índice "marca + modelo" da FIPE e grava em catalogo_cache.json.
 * Rode apenas via CLI (não uso na web). Uso:
 *   php build-catalogo.php
 *
 * Estrutura do cache: [ {"marca": "...", "marca_id": 59, "modelo": "...", "modelo_id": 5585, "chave": "VOLKSWAGEN POLO"} ]
 */
$base = 'https://parallelum.com.br/fipe/api/v1/carros';
$destino = __DIR__ . '/catalogo_cache.json';

function requisicoesParalelas(array $urls, int $paralelo = 12): array {
    $multi = curl_multi_init();
    $mapa = [];
    $filas = array_chunk($urls, $paralelo, true);
    foreach ($filas as $lote) {
        $handles = [];
        foreach ($lote as $chave => $url) {
            $h = curl_init($url);
            curl_setopt_array($h, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_USERAGENT => 'Gycanic/1.0',
            ]);
            curl_multi_add_handle($multi, $h);
            $handles[$chave] = $h;
        }
        do {
            $status = curl_multi_exec($multi, $ativo);
            if ($ativo) curl_multi_select($multi);
        } while ($ativo && $status === CURLM_OK);
        foreach ($handles as $chave => $h) {
            $mapa[$chave] = curl_multi_getcontent($h);
            curl_multi_remove_handle($multi, $h);
            curl_close($h);
        }
    }
    curl_multi_close($multi);
    return $mapa;
}

$marcasRaw = @file_get_contents("$base/marcas");
$marcas = json_decode($marcasRaw, true);
if (!is_array($marcas)) {
    fwrite(STDERR, "Falha ao carregar as marcas\n");
    exit(1);
}
fwrite(STDOUT, 'Marcas: ' . count($marcas) . "\n");

$urlsModelos = [];
foreach ($marcas as $m) {
    $urlsModelos[(int) $m['codigo']] = "$base/marcas/{$m['codigo']}/modelos";
}
$responses = requisicoesParalelas($urlsModelos, 14);

$idx = [];
foreach ($marcas as $m) {
    $idMarca = (int) $m['codigo'];
    $nomeMarca = $m['nome'];
    $corpo = $responses[$idMarca] ?? null;
    if (!$corpo) continue;
    $dados = json_decode($corpo, true);
    if (!isset($dados['modelos'])) continue;
    foreach ($dados['modelos'] as $mo) {
        $nomeModelo = $mo['nome'];
        $idx[] = [
            'marca' => $nomeMarca,
            'marca_id' => $idMarca,
            'modelo' => $nomeModelo,
            'modelo_id' => (int) $mo['codigo'],
            'chave' => "{$nomeMarca} - {$nomeModelo}",
        ];
    }
}

file_put_contents($destino, json_encode($idx, JSON_UNESCAPED_UNICODE));
fwrite(STDOUT, 'Total de modelos indexados: ' . count($idx) . "\n");
fwrite(STDOUT, 'Cache salvo em: ' . $destino . "\n");