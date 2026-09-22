<?php
/**
 * includes/api/reenviar-codigo.php
 * Gera um novo código de verificação e reenvia por e-mail.
 * Acessada por: api.php?acao=reenviar-codigo
 */
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: verificar.php');
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../verificacao.php';

$email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: verificar.php?erro=campos_vazios');
    exit;
}

if (!gy_pode_reenviar()) {
    header('Location: verificar.php?email=' . urlencode($email) . '&erro=limite_envios');
    exit;
}

$stmt = $pdo->prepare('SELECT id, nome, email, email_verificado FROM tblUsuarios WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$usuario = $stmt->fetch();

// E-mail inexistente ou já confirmado: responde como se o envio tivesse
// acontecido para não revelar quem possui conta.
if (!$usuario || (int) $usuario['email_verificado'] === 1) {
    header('Location: verificar.php?email=' . urlencode($email) . '&sucesso=codigo_enviado');
    exit;
}

$envio = gy_enviar_verificacao($pdo, $usuario);
$_SESSION['ultimo_envio'] = time();

if (!$envio['ok']) {
    header('Location: verificar.php?email=' . urlencode($email) . '&erro=email_falhou');
    exit;
}

header('Location: verificar.php?email=' . urlencode($email) . '&sucesso=codigo_enviado');
exit;
