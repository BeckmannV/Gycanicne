<?php
/**
 * backend/gerentes.php
 * Lista os gerentes cadastrados na tabela tbl_Gerente do banco de produção.
 */
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

$config = require __DIR__ . '/config.php';
$p = $config['production'];
try {
    $pdo = new PDO(
        "mysql:host={$p['host']};dbname={$p['dbname']};charset=utf8mb4",
        $p['user'],
        $p['pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
    exit;
}

$stmt = $pdo->query(
    'SELECT g.idGerente AS id, g.gerNome AS nome, g.gerEmail AS email,
            u.criado_em AS criado_em
     FROM tbl_Gerente g
     LEFT JOIN tblUsuarios u ON LOWER(u.email) = LOWER(g.gerEmail)
     ORDER BY g.gerNome ASC'
);
echo json_encode($stmt->fetchAll());