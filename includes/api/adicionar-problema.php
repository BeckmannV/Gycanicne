<?php
// Adiciona um problema a uma OS existente. Responde em JSON.
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'acesso_negado']);
    exit;
}
if (empty($_SERVER['CONTENT_TYPE']) || stripos($_SERVER['CONTENT_TYPE'], 'application/json') === false) {
    http_response_code(400);
    echo json_encode(['erro' => 'conteudo_invalido']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
$servicoId = (int) ($dados['servico_id'] ?? 0);
$titulo = trim((string) ($dados['titulo'] ?? ''));
$descricao = trim((string) ($dados['descricao'] ?? ''));

if ($servicoId <= 0 || $titulo === '') {
    http_response_code(422);
    echo json_encode(['erro' => 'campos_obrigatorios']);
    exit;
}

require_once __DIR__ . '/db.php';

$dono = $pdo->prepare('SELECT id FROM tblServicos WHERE id = :id AND usuario_id = :usuario_id');
$dono->execute([':id' => $servicoId, ':usuario_id' => $_SESSION['usuario_id']]);
if (!$dono->fetch()) {
    http_response_code(404);
    echo json_encode(['erro' => 'nao_encontrado']);
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO tblProblemas (servico_id, titulo, descricao) VALUES (:servico_id, :titulo, :descricao)'
);
$stmt->execute([
    ':servico_id' => $servicoId,
    ':titulo' => $titulo,
    ':descricao' => $descricao === '' ? null : $descricao,
]);

echo json_encode(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);