<?php
/**
 * api.php — único ponto de entrada do back-end.
 *
 * Cada ação é um arquivo dentro de includes/api/ (pasta bloqueada para acesso
 * direto pela web). Todas as chamadas do site passam por aqui.
 *
 * Exemplos:
 *   api.php?acao=servicos
 *   api.php?acao=fipe&recurso=marcas
 *   api.php?acao=veiculos&foto=Fiat%20Uno
 */

$acao = (string) ($_GET['acao'] ?? '');

/**
 * Ações liberadas. A lista branca também impede que arquivos internos
 * (db.php, config.php, build-catalogo.php) sejam executados pela web.
 */
$acoes = [
    'adicionar-funcionario',
    'adicionar-oficina',
    'adicionar-problema',
    'adicionar-servico',
    'atualizar-status',
    'auth',
    'cadastro',
    'carregar-funcionario',
    'editar-funcionario',
    'editar-problema',
    'excluir-funcionario',
    'excluir-problema',
    'excluir-servico',
    'fipe',
    'funcionarios',
    'login',
    'logout',
    'oficinas',
    'perfil',
    'servicos',
    'stats',
    'veiculos',
];

if (!in_array($acao, $acoes, true)) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(404);
    exit(json_encode(['erro' => 'acao_invalida']));
}

require __DIR__ . '/includes/api/' . $acao . '.php';
