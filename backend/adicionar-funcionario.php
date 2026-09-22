<?php
// Cadastra um novo funcionário (cargo 'funcionario') criado pelo gerente.
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    header('Location: ../login.html?erro=acesso');
    exit;
}

$permite = ['gerente'];
if (!in_array($_SESSION['usuario_tipo'] ?? 'funcionario', $permite, true)) {
    header('Location: ../funcionarios.html?erro=sem_permissao');
    exit;
}

require_once __DIR__ . '/db.php';

$nome = trim((string) filter_input(INPUT_POST, 'nome', FILTER_SANITIZE_SPECIAL_CHARS));
$email = trim((string) filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$senha = $_POST['senha'] ?? '';
$cargo = ($_POST['cargo'] ?? 'funcionario') === 'gerente' ? 'gerente' : 'funcionario';

if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $senha === '') {
    header('Location: ../funcionarios.html?erro=campos_vazios');
    exit;
}
if (strlen($senha) < 6) {
    header('Location: ../funcionarios.html?erro=senha_curta');
    exit;
}

$verifica = $pdo->prepare('SELECT id FROM tblUsuarios WHERE email = :email LIMIT 1');
$verifica->execute([':email' => $email]);
if ($verifica->fetch()) {
    header('Location: ../funcionarios.html?erro=email_existe');
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO tblUsuarios (nome, email, senha, cargo, documento, telefone, data_nascimento, funcao, endereco, cidade, uf, cep)
     VALUES (:nome, :email, :senha, :cargo, :documento, :telefone, :data_nascimento, :funcao, :endereco, :cidade, :uf, :cep)'
);

function vazio($valor) {
    return is_null($valor) || trim((string) $valor) === '';
}

$stmt->execute([
    ':nome' => $nome,
    ':email' => $email,
    ':senha' => password_hash($senha, PASSWORD_DEFAULT),
    ':cargo' => $cargo,
    ':documento' => vazio($_POST['documento'] ?? '') ? null : preg_replace('/\D/', '', $_POST['documento']),
    ':telefone' => vazio($_POST['telefone'] ?? '') ? null : preg_replace('/\D/', '', $_POST['telefone']),
    ':data_nascimento' => vazio($_POST['data_nascimento'] ?? '') ? null : $_POST['data_nascimento'],
    ':funcao' => vazio($_POST['funcao'] ?? '') ? null : trim($_POST['funcao']),
    ':endereco' => vazio($_POST['endereco'] ?? '') ? null : trim($_POST['endereco']),
    ':cidade' => vazio($_POST['cidade'] ?? '') ? null : trim($_POST['cidade']),
    ':uf' => vazio($_POST['uf'] ?? '') ? null : strtoupper(trim($_POST['uf'])),
    ':cep' => vazio($_POST['cep'] ?? '') ? null : preg_replace('/\D/', '', $_POST['cep']),
]);
header('Location: ../funcionarios.html?sucesso=funcionario_criado');
exit;