<?php
// Retorna os dados de UM usuário da tblUsuarios para a página de edição.
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autenticado']);
    exit;
}

require_once __DIR__ . '/db.php';

$id = (int) ($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['erro' => 'ID inválido']);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT id, nome, email, cargo, telefone, data_nascimento, funcao, endereco, cidade, uf, cep
     FROM tblUsuarios WHERE id = :id LIMIT 1'
);
$stmt->execute([':id' => $id]);
$usuario = $stmt->fetch();
if (!$usuario) {
    http_response_code(404);
    echo json_encode(['erro' => 'Usuário não encontrado']);
    exit;
}

echo json_encode($usuario);