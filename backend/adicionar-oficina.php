<?php
// Salva uma nova oficina vinculada ao usuário que está logado.
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    header('Location: ../login.php?erro=acesso');
    exit;
}

$permite = ['gerente'];
if (!in_array($_SESSION['usuario_tipo'] ?? 'funcionario', $permite, true)) {
    header('Location: ../oficinas.php?erro=sem_permissao');
    exit;
}

require_once __DIR__ . '/db.php';

$nome = trim((string) filter_input(INPUT_POST, 'nome-oficina', FILTER_SANITIZE_SPECIAL_CHARS));
$email = trim((string) filter_input(INPUT_POST, 'email-instituicao', FILTER_SANITIZE_EMAIL));
$cep = preg_replace('/\D/', '', $_POST['cep'] ?? '');
$documento = preg_replace('/\D/', '', $_POST['documento'] ?? '');
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($cep) !== 8 || !in_array(strlen($documento), [11, 14], true)) {
    header('Location: ../adicionar-oficina.php?erro=dados_invalidos');
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO tblOficinas (usuario_id, nome, email, cep, documento) VALUES (:usuario_id, :nome, :email, :cep, :documento)'
);
$stmt->execute([
    ':usuario_id' => $_SESSION['usuario_id'],
    ':nome' => $nome,
    ':email' => $email,
    ':cep' => $cep,
    ':documento' => $documento,
]);
header('Location: ../oficinas.php?sucesso=oficina_criada');
exit;
