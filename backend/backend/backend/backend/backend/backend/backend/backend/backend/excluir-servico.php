<?php
/**
 * backend/excluir-servico.php
 * Exclui uma OS (e seus problemas, via CASCADE) do usuário logado.
 */
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'metodo_nao_permitido']);
    exit;
}

require_once __DIR__ . '/db.php';

$corpo = json_decode(file_get_contents('php://input'), true);
$id = (int) ($corpo['id'] ?? 0);
if ($id <= 0) {
    echo json_encode(['ok' => false, 'erro' => 'dados_invalidos']);
    exit;
}

$stmt = $pdo->prepare(
    'DELETE FROM tblServicos WHERE id = :id AND usuario_id = :usuario_id'
);
$stmt->execute([':id' => $id, ':usuario_id' => $_SESSION['usuario_id']]);

if ($stmt->rowCount() === 0) {
    echo json_encode(['ok' => false, 'erro' => 'nao_encontrado']);
    exit;
}

echo json_encode(['ok' => true]);
