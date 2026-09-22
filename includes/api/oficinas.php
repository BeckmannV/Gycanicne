<?php
// Retorna em JSON apenas as oficinas do usuário da sessão atual.
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

require_once __DIR__ . '/db.php';

$stmt = $pdo->prepare(
    'SELECT id, nome, email, cep, criado_em FROM tblOficinas WHERE usuario_id = :usuario_id ORDER BY criado_em DESC'
);
$stmt->execute([':usuario_id' => $_SESSION['usuario_id']]);
echo json_encode($stmt->fetchAll());
