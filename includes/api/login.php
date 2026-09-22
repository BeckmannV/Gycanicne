<?php
// Valida as credenciais e cria a sessão do usuário.
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/db.php';

$email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$senha = $_POST['senha'] ?? '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $senha === '') {
    header('Location: login.php?erro=1');
    exit;
}

$stmt = $pdo->prepare('SELECT id, nome, email, senha, cargo FROM tblUsuarios WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$usuario = $stmt->fetch();
if (!$usuario || !password_verify($senha, $usuario['senha'])) {
    header('Location: login.php?erro=1');
    exit;
}

session_regenerate_id(true);
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_email'] = $usuario['email'];
$_SESSION['usuario_tipo'] = $usuario['cargo'];
header('Location: oficinas.php');
exit;
