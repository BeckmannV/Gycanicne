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

$stmt = $pdo->prepare(
    'SELECT id, nome, email, senha, cargo, email_verificado
       FROM tblUsuarios WHERE email = :email LIMIT 1'
);
$stmt->execute([':email' => $email]);
$usuario = $stmt->fetch();
if (!$usuario || !password_verify($senha, $usuario['senha'])) {
    header('Location: login.php?erro=1');
    exit;
}

// Conta ainda não confirmada: reenvia o código e manda para a tela de verificação.
if ((int) $usuario['email_verificado'] !== 1) {
    require_once __DIR__ . '/../verificacao.php';
    $envio = gy_enviar_verificacao($pdo, $usuario);
    $_SESSION['ultimo_envio'] = time();

    $destino = 'verificar.php?email=' . urlencode($email);
    header('Location: ' . $destino . ($envio['ok'] ? '&reenviado=1' : '&erro=email_falhou'));
    exit;
}

session_regenerate_id(true);
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_email'] = $usuario['email'];
$_SESSION['usuario_tipo'] = $usuario['cargo'];
header('Location: oficinas.php');
exit;
