<?php
// Atualiza o status de um problema pertencente a uma OS do usuário. JSON.
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$problemaId = (int) ($dados['id'] ?? 0);
$status = (string) ($dados['status'] ?? '');

$permitidos = ['em_analise', 'aguardando', 'resolvido'];
if ($problemaId <= 0 || !in_array($status, $permitidos, true)) {
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

$stmt = $pdo->prepare('UPDATE tblProblemas SET status = :status WHERE id = :id');
$stmt->execute([':status' => $status, ':id' => $problemaId]);

echo json_encode(['ok' => true]);