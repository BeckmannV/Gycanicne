<?php
// Contagens agregadas exibidas na página inicial.
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$resposta = [
    'authenticated' => isset($_SESSION['usuario_id']),
    'total_oficinas' => 0,
    'total_usuarios' => 0,
    'minhas_oficinas' => 0,
];

try {
    $resposta['total_oficinas'] = (int) $pdo->query(
        'SELECT COUNT(*) FROM tblOficinas'
    )->fetchColumn();

    $resposta['total_usuarios'] = (int) $pdo->query(
        'SELECT COUNT(*) FROM tblUsuarios'
    )->fetchColumn();

    if (isset($_SESSION['usuario_id'])) {
        $stmt = $pdo->prepare(
            'SELECT COUNT(*) FROM tblOficinas WHERE usuario_id = :usuario_id'
        );
        $stmt->execute([':usuario_id' => $_SESSION['usuario_id']]);
        $resposta['minhas_oficinas'] = (int) $stmt->fetchColumn();
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode($resposta);
    exit;
}

echo json_encode($resposta);