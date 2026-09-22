<?php
/**
 * Lê as variáveis do arquivo .env que fica na raiz do projeto.
 *
 * Uso: gy_env('MAIL_DRIVER', 'log')
 * O valor da variável de ambiente (quando existir) tem prioridade.
 */

function gy_env(string $chave, string $padrao = ''): string
{
    static $variaveis = null;

    if ($variaveis === null) {
        $variaveis = [];
        $arquivo = dirname(__DIR__) . '/.env';
        if (is_file($arquivo)) {
            foreach (file($arquivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $linha) {
                $linha = trim($linha);
                if ($linha === '' || str_starts_with($linha, '#') || !str_contains($linha, '=')) {
                    continue;
                }
                [$k, $v] = explode('=', $linha, 2);
                $variaveis[trim($k)] = trim($v, " \t\"'");
            }
        }
    }

    $valor = getenv($chave);
    if ($valor !== false && $valor !== '') {
        return $valor;
    }

    return $variaveis[$chave] ?? $padrao;
}
