<?php
/**
 * Verificação de e-mail por código de 6 dígitos (válido por 15 minutos).
 * O código é gravado no banco como hash (sha256), nunca em texto puro.
 */

require_once __DIR__ . '/email.php';

/**
 * Gera um novo código, grava no banco e envia por e-mail.
 * $usuario precisa ter id, nome e email.
 */
function gy_enviar_verificacao(PDO $pdo, array $usuario): array
{
    $codigo = (string) random_int(100000, 999999);

    $pdo->prepare(
        'UPDATE tblUsuarios
            SET codigo_verificacao = :codigo,
                codigo_expira_em = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
          WHERE id = :id'
    )->execute([':codigo' => hash('sha256', $codigo), ':id' => $usuario['id']]);

    return gy_enviar_email(
        (string) $usuario['email'],
        'Seu código de verificação é ' . $codigo,
        gy_email_verificacao_html((string) ($usuario['nome'] ?? ''), $codigo)
    );
}

/**
 * Confere o código informado pelo usuário.
 * Devolve ['ok' => true, 'usuario' => ...] ou ['ok' => false, 'motivo' => ...].
 */
function gy_validar_codigo(PDO $pdo, string $email, string $codigo): array
{
    $codigo = trim($codigo);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $codigo)) {
        return ['ok' => false, 'motivo' => 'codigo_invalido'];
    }

    // A comparação de horário é feita pelo banco (mesmo relógio que gravou),
    // evitando divergência de fuso entre PHP e MySQL.
    $stmt = $pdo->prepare(
        'SELECT id, nome, email, cargo, email_verificado, codigo_verificacao,
                (codigo_expira_em > NOW()) AS codigo_no_prazo
           FROM tblUsuarios WHERE email = :email LIMIT 1'
    );
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch();

    if (!$usuario || !$usuario['codigo_verificacao']) {
        return ['ok' => false, 'motivo' => 'codigo_invalido'];
    }

    if ((int) $usuario['codigo_no_prazo'] !== 1) {
        return ['ok' => false, 'motivo' => 'codigo_expirado'];
    }

    if (!hash_equals((string) $usuario['codigo_verificacao'], hash('sha256', $codigo))) {
        return ['ok' => false, 'motivo' => 'codigo_invalido'];
    }

    $pdo->prepare(
        'UPDATE tblUsuarios
            SET email_verificado = 1, codigo_verificacao = NULL, codigo_expira_em = NULL
          WHERE id = :id'
    )->execute([':id' => $usuario['id']]);

    return ['ok' => true, 'usuario' => $usuario];
}

/** Limite de 1 reenvio por minuto, por sessão. */
function gy_pode_reenviar(): bool
{
    return empty($_SESSION['ultimo_envio']) || (time() - (int) $_SESSION['ultimo_envio']) >= 60;
}

/** Corpo do e-mail com o código (HTML simples, sem dependências). */
function gy_email_verificacao_html(string $nome, string $codigo): string
{
    $nomeSeguro = htmlspecialchars($nome !== '' ? $nome : 'usuário', ENT_QUOTES, 'UTF-8');

    return '<div style="font-family:Arial,Helvetica,sans-serif;background:#0a0f14;padding:24px">'
        . '<div style="max-width:480px;margin:0 auto;background:#111827;border:1px solid #374151;border-radius:12px;padding:24px">'
        . '<p style="font-size:20px;font-weight:700;color:#f97316;margin:0 0 16px">Gycanic</p>'
        . '<h1 style="font-size:18px;color:#f9fafb;margin:0 0 8px">Olá, ' . $nomeSeguro . '</h1>'
        . '<p style="color:#d1d5db;margin:0 0 16px">Use o código abaixo para confirmar seu e-mail:</p>'
        . '<p style="font-size:32px;letter-spacing:8px;font-weight:700;text-align:center;background:#1f2937;'
        . 'border:1px solid #374151;border-radius:8px;padding:14px;margin:0 0 16px;color:#fff">' . $codigo . '</p>'
        . '<p style="color:#9ca3af;font-size:13px;margin:0">O código vale por 15 minutos. '
        . 'Se você não criou esta conta, ignore este e-mail.</p>'
        . '</div></div>';
}
