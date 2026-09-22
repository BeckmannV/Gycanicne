<?php
// Exclui um usuário cadastrado. Um gerente não pode excluir outro gerente.
session_start();

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autenticado']);
    exit;
}

$permite = ['gerente'];
if (!in_array($_SESSION['usuario_tipo'] ?? 'funcionario', $permite, true)) {
    http_response_code(403);
    echo json_encode(['erro' => 'Sem permissão para excluir usuários']);
    exit;
}

require_once __DIR__ . '/db.php';

$id = (int) ($_POST['id'] ?? 0);
if ($id <= 0) {
    echo json_encode(['erro' => 'Dados inválidos']);
    exit;
}

// Não permite excluir a si mesmo.
if ($id === (int) $_SESSION['usuario_id']) {
    echo json_encode(['erro' => 'Você não pode excluir sua própria conta']);
    exit;
}

// Um gerente não pode excluir outro gerente.
$stmt = $pdo->prepare('SELECT cargo FROM tblUsuarios WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$alvo = $stmt->fetch();
if (!$alvo) {
    echo json_encode(['erro' => 'Usuário não encontrado']);
    exit;
}
if ($alvo['cargo'] === 'gerente') {
    echo json_encode(['erro' => 'Um gerente não pode excluir outro gerente']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM tblUsuarios WHERE id = :id');
$stmt->execute([':id' => $id]);

echo json_encode(['ok' => true]);