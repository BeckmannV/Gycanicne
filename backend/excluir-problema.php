<?php
// Exclui um problema de uma OS do usuário atual. Responde em JSON.
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$servicoId = (int) ($dados['servico_id'] ?? 0);
$problemaId = (int) ($dados['id'] ?? 0);

if ($servicoId <= 0 || $problemaId <= 0) {
    http_response_code(422);
    echo json_encode(['erro' => 'dados_invalidos']);
    exit;
}

require_once __DIR__ . '/db.php';

// Garante que a OS pertence ao usuário atual.
$dono = $pdo->prepare('SELECT id FROM tblServicos WHERE id = :id AND usuario_id = :usuario_id');
$dono->execute([':id' => $servicoId, ':usuario_id' => $_SESSION['usuario_id']]);
if (!$dono->fetch()) {
    http_response_code(404);
    echo json_encode(['erro' => 'nao_encontrado']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM tblProblemas WHERE id = :id AND servico_id = :servico_id');
$stmt->execute([':id' => $problemaId, ':servico_id' => $servicoId]);

echo json_encode(['ok' => true]);