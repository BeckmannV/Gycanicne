<?php
/**
 * api.php?acao=perfil
 * Atualiza nome e foto de perfil do usuário logado.
 * GET  -> devolve os dados atuais (id, nome, email, cargo, foto).
 * POST -> salva nome e/ou foto (multipart/form-data).
 */
session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autenticado']);
    exit;
}

require_once __DIR__ . '/db.php';

// Diretório dedicado às fotos dos usuários.
$fotoDir = dirname(__DIR__, 2) . '/uploads';
if (!is_dir($fotoDir)) {
    mkdir($fotoDir, 0775, true);
}

// Endpoint de leitura.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $stmt = $pdo->prepare(
        'SELECT id, nome, email, cargo, foto, criado_em FROM tblUsuarios WHERE id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $_SESSION['usuario_id']]);
    $usuario = $stmt->fetch();
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['erro' => 'Usuário não encontrado']);
        exit;
    }
    echo json_encode($usuario);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$id = (int) $_SESSION['usuario_id'];

// Troca de senha (ação separada, sem foto/nome).
if (($_POST['action'] ?? '') === 'trocar_senha') {
    $atual = (string) ($_POST['senha_atual'] ?? '');
    $nova = (string) ($_POST['nova_senha'] ?? '');
    $confirmacao = (string) ($_POST['confirmar_senha'] ?? '');

    if ($atual === '' || $nova === '') {
        echo json_encode(['erro' => 'Preencha a senha atual e a nova senha']);
        exit;
    }
    if (strlen($nova) < 6) {
        echo json_encode(['erro' => 'A nova senha deve ter no mínimo 6 caracteres']);
        exit;
    }
    if ($nova !== $confirmacao) {
        echo json_encode(['erro' => 'A confirmação não confere com a nova senha']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT senha FROM tblUsuarios WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $hashAtual = (string) $stmt->fetchColumn();
    if (!password_verify($atual, $hashAtual)) {
        echo json_encode(['erro' => 'Senha atual incorreta']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE tblUsuarios SET senha = :senha WHERE id = :id');
    $stmt->execute([':senha' => password_hash($nova, PASSWORD_DEFAULT), ':id' => $id]);
    echo json_encode(['ok' => true, 'mensagem' => 'Senha atualizada com sucesso.']);
    exit;
}
$novoNome = trim((string) ($_POST['nome'] ?? ''));

// Atualiza imagem enviada pelo formulário.
$fotoSalva = null;
if (!empty($_FILES['foto']['name']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    $arquivo = $_FILES['foto'];
    if ($arquivo['size'] > 2 * 1024 * 1024) {
        echo json_encode(['erro' => 'Imagem muito grande (máx. 2 MB)']);
        exit;
    }
    $fim = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
    $permitidos = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($fim, $permitidos, true)) {
        echo json_encode(['erro' => 'Formato de imagem inválido']);
        exit;
    }
    // Valida o conteúdo real do arquivo (impede PHP disfarçado de imagem).
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->buffer(file_get_contents($arquivo['tmp_name']));
    $mimeValido = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];
    if (!isset($mimeValido[$mime])) {
        echo json_encode(['erro' => 'Arquivo não é uma imagem válida']);
        exit;
    }
    $fim = $mimeValido[$mime];
    $nomeArquivo = 'perfil_' . $id . '_' . bin2hex(random_bytes(6)) . '.' . $fim;
    $destino = $fotoDir . '/' . $nomeArquivo;
    if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
        echo json_encode(['erro' => 'Não foi possível salvar a imagem']);
        exit;
    }

    // Remove a foto anterior, se existir.
    $stmt = $pdo->prepare('SELECT foto FROM tblUsuarios WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $antiga = $stmt->fetchColumn();
    if ($antiga && strpos($antiga, 'uploads/') === 0) {
        $caminho = __DIR__ . '/../' . $antiga;
        if (is_file($caminho)) {
            @unlink($caminho);
        }
    }
    $fotoSalva = 'uploads/' . $nomeArquivo;
}

// Mantém o nome atual quando o campo vier vazio.
$stmt = $pdo->prepare('SELECT nome FROM tblUsuarios WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$nomeAtual = (string) $stmt->fetchColumn();
$nomeFinal = $novoNome !== '' ? $novoNome : $nomeAtual;

if ($fotoSalva !== null) {
    $stmt = $pdo->prepare('UPDATE tblUsuarios SET nome = :nome, foto = :foto WHERE id = :id');
    $stmt->execute([':nome' => $nomeFinal, ':foto' => $fotoSalva, ':id' => $id]);
} else {
    $stmt = $pdo->prepare('UPDATE tblUsuarios SET nome = :nome WHERE id = :id');
    $stmt->execute([':nome' => $nomeFinal, ':id' => $id]);
}

// Atualiza a sessão com o novo nome.
$stmt = $pdo->prepare('SELECT id, nome, email, cargo, foto FROM tblUsuarios WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$usuario = $stmt->fetch();

$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_email'] = $usuario['email'];
$_SESSION['usuario_tipo'] = $usuario['cargo'];

echo json_encode(['ok' => true, 'usuario' => $usuario]);