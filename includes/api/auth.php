<?php
/**
 * includes/api/auth.php
 * Verifica se o usuário está autenticado e retorna JSON.
 * Acessada por: api.php?acao=auth
 */

session_start();
header('Content-Type: application/json; charset=utf-8');

// Se a sessão contém dados do usuário, está autenticado
if (isset($_SESSION['usuario_id'])) {
    $foto = null;
    try {
        require_once __DIR__ . '/db.php';
        $stmt = $pdo->prepare('SELECT foto FROM tblUsuarios WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $_SESSION['usuario_id']]);
        $foto = $stmt->fetchColumn();
    } catch (Exception $e) {
        $foto = null;
    }
    echo json_encode([
        'authenticated' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nome' => $_SESSION['usuario_nome'] ?? 'Usuário',
            'email' => $_SESSION['usuario_email'] ?? '',
            'tipo' => $_SESSION['usuario_tipo'] ?? 'funcionario',
            'foto' => $foto,
        ]
    ]);
} else {
    echo json_encode(['authenticated' => false]);
}
