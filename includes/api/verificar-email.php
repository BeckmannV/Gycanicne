<?php
/**
 * includes/api/verificar-email.php
 * Confere o código enviado por e-mail e libera a sessão do usuário.
 * Acessada por: api.php?acao=verificar-email
 */
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: verificar.php');
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../verificacao.php';

$email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$codigo = trim((string) ($_POST['codigo'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $codigo === '') {
    header('Location: verificar.php?email=' . urlencode($email) . '&erro=campos_vazios');
    exit;
}

$resultado = gy_validar_codigo($pdo, $email, $codigo);

if (!$resultado['ok']) {
    header('Location: verificar.php?email=' . urlencode($email) . '&erro=' . $resultado['motivo']);
    exit;
}

$usuario = $resultado['usuario'];
session_regenerate_id(true);
$_SESSION['usuario_id'] = (int) $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_email'] = $usuario['email'];
$_SESSION['usuario_tipo'] = $usuario['cargo'];
header('Location: oficinas.php');
exit;
