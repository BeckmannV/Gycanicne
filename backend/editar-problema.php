<?php
// Edita um problema (título, descrição e status) de uma OS do usuário. JSON.
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$problemaId = (int) ($dados['id'] ?? 0);
$titulo = trim((string) ($dados['titulo'] ?? ''));
$descricao = trim((string) ($dados['descricao'] ?? ''));
$status = (string) ($dados['status'] ?? '');

$permitidos = ['em_analise', 'aguardando', 'resolvido'];
if ($problemaId <= 0 || $titulo === '' || ($status !== '' && !in_array($status, $permitidos, true))) {
    http_response_code(422);
    echo json_encode(['erro' => 'dados_invalidos']);
    exit;
}

require_once __DIR__ . '/db.php';

// Garante que a OS do problema pertence ao usuário atual.
$dono = $pdo->prepare(
    'SELECT p.id FROM tblProblemas p
     INNER JOIN tblServicos s ON s.id = p.servico_id
     WHERE p.id = :id AND s.usuario_id = :usuario_id'
);
$dono->execute([':id' => $problemaId, ':usuario_id' => $_SESSION['usuario_id']]);
if (!$dono->fetch()) {
    http_response_code(404);
    echo json_encode(['erro' => 'nao_encontrado']);
    exit;
}

$campos = 'titulo = :titulo, descricao = :descricao';
$params = [
    ':titulo' => $titulo,
    ':descricao' => $descricao === '' ? null : $descricao,
    ':id' => $problemaId,
];
if ($status !== '') {
    $campos .= ', status = :status';
    $params[':status'] = $status;
}

$stmt = $pdo->prepare("UPDATE tblProblemas SET $campos WHERE id = :id");
$stmt->execute($params);

echo json_encode(['ok' => true]);
