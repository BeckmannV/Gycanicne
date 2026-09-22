<?php
// Cria uma conta de usuário (visualização) e já inicia a sessão após o cadastro.
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: cadastro.php');
    exit;
}

require_once __DIR__ . '/db.php';

$nome = trim((string) filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_SPECIAL_CHARS));
$email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$senha = $_POST['senha'] ?? '';
$confirmacao = $_POST['confirmar-senha'] ?? '';
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $senha === '') {
    header('Location: cadastro.php?erro=campos_vazios');
    exit;
}

if (strlen($senha) < 6) {
    header('Location: cadastro.php?erro=senha_curta');
    exit;
}

if ($senha !== $confirmacao) {
    header('Location: cadastro.php?erro=senhas_diferentes');
    exit;
}

$verifica = $pdo->prepare('SELECT id FROM tblUsuarios WHERE email = :email LIMIT 1');
$verifica->execute([':email' => $email]);
if ($verifica->fetch()) {
    header('Location: cadastro.php?erro=email_existe');
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO tblUsuarios (nome, email, senha, cargo, email_verificado)
     VALUES (:nome, :email, :senha, :cargo, 0)'
);
$stmt->execute([
    ':nome' => $nome,
    ':email' => $email,
    ':senha' => password_hash($senha, PASSWORD_DEFAULT),
    ':cargo' => 'usuario',
]);

// Envia o código de verificação; o acesso só é liberado na tela verificar.php.
require_once __DIR__ . '/../verificacao.php';
$envio = gy_enviar_verificacao($pdo, [
    'id' => (int) $pdo->lastInsertId(),
    'nome' => $nome,
    'email' => $email,
]);

header('Location: verificar.php?email=' . urlencode($email) . ($envio['ok'] ? '&enviado=1' : '&erro=email_falhou'));
exit;
