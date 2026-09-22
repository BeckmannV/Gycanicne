<?php
// Cria uma nova OS e redireciona para a página de acompanhamento.
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['usuario_id'])) {
    header('Location: ../adicionar-servico.php?erro=acesso');
    exit;
}

require_once __DIR__ . '/db.php';

function vazio($v) {
    return is_null($v) || trim((string) $v) === '';
}

$titulo = trim((string) filter_input(INPUT_POST, 'titulo', FILTER_SANITIZE_SPECIAL_CHARS));
$cliente = trim((string) filter_input(INPUT_POST, 'cliente', FILTER_SANITIZE_SPECIAL_CHARS));
$clienteEmail = trim((string) filter_input(INPUT_POST, 'cliente_email', FILTER_SANITIZE_EMAIL));
$clienteTelefone = trim((string) filter_input(INPUT_POST, 'cliente_telefone', FILTER_SANITIZE_SPECIAL_CHARS));
$veiculo = trim((string) filter_input(INPUT_POST, 'veiculo', FILTER_SANITIZE_SPECIAL_CHARS));
$placa = strtoupper(trim((string) filter_input(INPUT_POST, 'placa', FILTER_SANITIZE_SPECIAL_CHARS)));
$ano = trim((string) filter_input(INPUT_POST, 'ano', FILTER_SANITIZE_NUMBER_INT));
$cor = trim((string) filter_input(INPUT_POST, 'cor', FILTER_SANITIZE_SPECIAL_CHARS));
$servico = trim((string) filter_input(INPUT_POST, 'servico', FILTER_SANITIZE_SPECIAL_CHARS));
$funcionarioId = (int) filter_input(INPUT_POST, 'funcionario_id', FILTER_SANITIZE_NUMBER_INT);

if ($titulo === '') {
    header('Location: ../adicionar-servico.php?erro=campos_vazios');
    exit;
}

// O responsável atribuído deve existir.
if ($funcionarioId > 0) {
    $check = $pdo->prepare('SELECT id FROM tblUsuarios WHERE id = :id');
    $check->execute([':id' => $funcionarioId]);
    if (!$check->fetch()) {
        $funcionarioId = null;
    }
} else {
    $funcionarioId = null;
}

$stmt = $pdo->prepare(
    'INSERT INTO tblServicos
        (usuario_id, titulo, cliente, cliente_telefone, cliente_email, veiculo, placa, ano, cor, servico, funcionario_id)
     VALUES
        (:usuario_id, :titulo, :cliente, :cliente_telefone, :cliente_email, :veiculo, :placa, :ano, :cor, :servico, :funcionario_id)'
);
$stmt->execute([
    ':usuario_id' => $_SESSION['usuario_id'],
    ':titulo' => $titulo,
    ':cliente' => vazio($cliente) ? null : $cliente,
    ':cliente_telefone' => vazio($clienteTelefone) ? null : preg_replace('/\D/', '', $clienteTelefone),
    ':cliente_email' => vazio($clienteEmail) ? null : $clienteEmail,
    ':veiculo' => vazio($veiculo) ? null : $veiculo,
    ':placa' => vazio($placa) ? null : $placa,
    ':ano' => vazio($ano) ? null : $ano,
    ':cor' => vazio($cor) ? null : $cor,
    ':servico' => vazio($servico) ? null : $servico,
    ':funcionario_id' => $funcionarioId,
]);

header('Location: ../servicos.php?sucesso=os_criada');
exit;