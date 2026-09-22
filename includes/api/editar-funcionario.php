<?php
// Atualiza nome, e-mail e cargo de um usuário cadastrado.
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(401);
    echo json_encode(['erro' => 'Não autenticado']);
    exit;
}

$permite = ['gerente'];
if (!in_array($_SESSION['usuario_tipo'] ?? 'funcionario', $permite, true)) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(403);
    echo json_encode(['erro' => 'Sem permissão para editar usuários']);
    exit;
}

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$id = (int) ($_POST['id'] ?? 0);
$nome = trim((string) ($_POST['nome'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$cargo = (string) ($_POST['cargo'] ?? '');

if ($id <= 0 || $nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['erro' => 'Dados inválidos']);
    exit;
}
if (!in_array($cargo, ['gerente', 'funcionario', 'usuario'], true)) {
    echo json_encode(['erro' => 'Nível de acesso inválido']);
    exit;
}

// Verifica se o usuário a ser editado existe e não é o próprio logado.
$stmt = $pdo->prepare('SELECT id FROM tblUsuarios WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
if (!$stmt->fetch()) {
    echo json_encode(['erro' => 'Usuário não encontrado']);
    exit;
}

if ($id === (int) $_SESSION['usuario_id']) {
    echo json_encode(['erro' => 'Edite seu próprio perfil pela página Perfil']);
    exit;
}

// Evita e-mail duplicado.
$verifica = $pdo->prepare('SELECT id FROM tblUsuarios WHERE email = :email AND id <> :id LIMIT 1');
$verifica->execute([':email' => $email, ':id' => $id]);
if ($verifica->fetch()) {
    echo json_encode(['erro' => 'Este e-mail já está em uso']);
    exit;
}

$stmt = $pdo->prepare(
    'UPDATE tblUsuarios SET nome = :nome, email = :email, cargo = :cargo,
        telefone = :telefone, data_nascimento = :data_nascimento,
        funcao = :funcao, endereco = :endereco, cidade = :cidade,
        uf = :uf, cep = :cep
     WHERE id = :id'
);

function gy_vazio($valor) {
    return is_null($valor) || trim((string) $valor) === '';
}

$stmt->execute([
    ':nome' => $nome,
    ':email' => $email,
    ':cargo' => $cargo,
    ':telefone' => gy_vazio($_POST['telefone'] ?? '') ? null : preg_replace('/\D/', '', $_POST['telefone']),
    ':data_nascimento' => gy_vazio($_POST['data_nascimento'] ?? '') ? null : $_POST['data_nascimento'],
    ':funcao' => gy_vazio($_POST['funcao'] ?? '') ? null : trim($_POST['funcao']),
    ':endereco' => gy_vazio($_POST['endereco'] ?? '') ? null : trim($_POST['endereco']),
    ':cidade' => gy_vazio($_POST['cidade'] ?? '') ? null : trim($_POST['cidade']),
    ':uf' => gy_vazio($_POST['uf'] ?? '') ? null : strtoupper(trim($_POST['uf'])),
    ':cep' => gy_vazio($_POST['cep'] ?? '') ? null : preg_replace('/\D/', '', $_POST['cep']),
    ':id' => $id,
]);

echo json_encode(['ok' => true]);