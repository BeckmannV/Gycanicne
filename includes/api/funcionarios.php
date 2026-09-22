<?php
// Lista os funcionários cadastrados na plataforma.
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

require_once __DIR__ . '/db.php';

$stmt = $pdo->query(
    'SELECT id, nome, email, cargo, funcao, telefone, criado_em FROM tblUsuarios ORDER BY nome ASC'
);
echo json_encode($stmt->fetchAll());