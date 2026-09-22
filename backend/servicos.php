<?php
/**
 * backend/servicos.php
 * Retorna as OS do usuário com problemas e funcionário em UMA query (sem N+1).
 */
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}

require_once __DIR__ . '/db.php';

$stmt = $pdo->prepare(
    "SELECT s.id, s.titulo, s.cliente, s.cliente_telefone, s.cliente_email,
            s.veiculo, s.placa, s.ano, s.cor, s.servico, s.status, s.criado_em,
            f.id AS funcionario_id, f.nome AS funcionario_nome, f.funcao AS funcionario_funcao
     FROM tblServicos s
     LEFT JOIN tblUsuarios f ON f.id = s.funcionario_id
     WHERE s.usuario_id = :usuario_id
     ORDER BY s.criado_em DESC"
);
$stmt->execute([':usuario_id' => $_SESSION['usuario_id']]);
$linhas = $stmt->fetchAll();

$servicos = [];
$ids = [];
foreach ($linhas as $linha) {
    $ids[] = (int) $linha['id'];
    $servicos[$linha['id']] = [
        'id' => (int) $linha['id'],
        'titulo' => $linha['titulo'],
        'cliente' => $linha['cliente'],
        'cliente_telefone' => $linha['cliente_telefone'],
        'cliente_email' => $linha['cliente_email'],
        'veiculo' => $linha['veiculo'],
        'placa' => $linha['placa'],
        'ano' => $linha['ano'],
        'cor' => $linha['cor'],
        'servico' => $linha['servico'],
        'status' => $linha['status'],
        'criado_em' => $linha['criado_em'],
        'funcionario' => $linha['funcionario_id']
            ? [
                'id' => (int) $linha['funcionario_id'],
                'nome' => $linha['funcionario_nome'],
                'funcao' => $linha['funcionario_funcao'],
            ]
            : null,
        'problemas' => [],
    ];
}

if ($ids) {
    $marcadores = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT id, servico_id, titulo, descricao, status, criado_em
         FROM tblProblemas
         WHERE servico_id IN ($marcadores)
         ORDER BY id ASC"
    );
    $stmt->execute($ids);
    foreach ($stmt->fetchAll() as $problema) {
        $servicos[$problema['servico_id']]['problemas'][] = [
            'id' => (int) $problema['id'],
            'titulo' => $problema['titulo'],
            'descricao' => $problema['descricao'],
            'status' => $problema['status'],
            'criado_em' => $problema['criado_em'],
        ];
    }
}

echo json_encode(array_values($servicos));