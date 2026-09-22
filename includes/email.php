<?php
/**
 * Envio de e-mails do site (código de verificação de conta).
 *
 * O motor é escolhido pela variável MAIL_DRIVER, definida no .env da raiz:
 *
 *   log  (padrão) — não envia: grava o e-mail em includes/api/mail.log
 *                   (ideal para desenvolvimento e testes)
 *   mail          — usa a função mail() do servidor (a HostGator já envia)
 *   api           — usa uma API HTTP, escolhida em MAIL_PROVIDER:
 *                     brevo  → https://www.brevo.com  (exige BREVO_API_KEY)
 *                     resend → https://resend.com     (exige RESEND_API_KEY)
 */

require_once __DIR__ . '/env.php';

function gy_enviar_email(string $para, string $assunto, string $html): array
{
    $driver = gy_env('MAIL_DRIVER', 'log');
    $de = gy_env('MAIL_FROM', 'nao-responda@gycanic.com.br');
    $nome = gy_env('MAIL_FROM_NAME', 'Gycanic');

    if ($driver === 'api') {
        $provedor = strtolower(gy_env('MAIL_PROVIDER', 'brevo'));
        $chave = gy_env($provedor === 'resend' ? 'RESEND_API_KEY' : 'BREVO_API_KEY');

        if ($chave !== '') {
            return gy_email_api($para, $assunto, $html, $de, $nome);
        }

        // Sem chave no .env: em vez de travar o cadastro, cai para o mail()
        // do servidor e registra o aviso no log.
        gy_email_registrar_falha([
            'motor' => 'api',
            'erro' => 'chave da API ausente no .env — usando o mail() do servidor',
        ]);
        $driver = 'mail';
    }

    if ($driver === 'mail') {
        $cabecalhos = 'From: ' . $nome . ' <' . $de . ">\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\n";
        $ok = @mail($para, $assunto, $html, $cabecalhos);
        return ['ok' => $ok, 'motor' => 'mail', 'erro' => $ok ? null : 'mail() retornou false (confira o sendmail do servidor)'];
    }

    // Motor "log": nada sai do servidor; o texto fica em includes/api/mail.log
    $registro = 'Para: ' . $para . ' | Assunto: ' . $assunto . "\n" . $html . "\n---\n";
    $ok = file_put_contents(__DIR__ . '/api/mail.log', $registro, FILE_APPEND) !== false;
    return ['ok' => $ok, 'motor' => 'log', 'erro' => $ok ? null : 'falha ao gravar includes/api/mail.log'];
}

/** Envia o e-mail por API HTTP (Brevo ou Resend) com cURL. */
function gy_email_api(string $para, string $assunto, string $html, string $de, string $nome): array
{
    $provedor = strtolower(gy_env('MAIL_PROVIDER', 'brevo'));
    $chave = gy_env($provedor === 'resend' ? 'RESEND_API_KEY' : 'BREVO_API_KEY');

    if ($chave === '') {
        $resultado = ['ok' => false, 'motor' => 'api', 'erro' => 'chave ausente no .env (BREVO_API_KEY / RESEND_API_KEY)'];
        gy_email_registrar_falha($resultado);
        return $resultado;
    }

    if ($provedor === 'resend') {
        $url = 'https://api.resend.com/emails';
        $cabecalhos = ['Authorization: Bearer ' . $chave, 'Content-Type: application/json'];
        $corpo = [
            'from' => $nome . ' <' . $de . '>',
            'to' => [$para],
            'subject' => $assunto,
            'html' => $html,
        ];
    } else {
        $url = 'https://api.brevo.com/v3/smtp/email';
        $cabecalhos = ['accept: application/json', 'api-key: ' . $chave, 'Content-Type: application/json'];
        $corpo = [
            'sender' => ['name' => $nome, 'email' => $de],
            'to' => [['email' => $para]],
            'subject' => $assunto,
            'htmlContent' => $html,
        ];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($corpo, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER => $cabecalhos,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT => 20,
    ]);
    $resposta = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erroCurl = (string) curl_error($ch);
    curl_close($ch);

    if ($resposta === false || $status >= 300) {
        $detalhe = $erroCurl !== '' ? $erroCurl : substr((string) $resposta, 0, 300);
        $resultado = ['ok' => false, 'motor' => 'api', 'erro' => 'HTTP ' . $status . ' — ' . $detalhe];
        gy_email_registrar_falha($resultado);
        return $resultado;
    }

    // Sucesso também fica registrado (sem o corpo do e-mail) para diagnóstico.
    $json = json_decode((string) $resposta, true);
    @file_put_contents(
        __DIR__ . '/mail.log',
        '[OK brevo] para: ' . $para . ' | HTTP ' . $status . ' | messageId: ' . ($json['messageId'] ?? '-') . "\n",
        FILE_APPEND
    );

    return ['ok' => true, 'motor' => 'api', 'status' => $status];
}

/** Guarda a falha no log para diagnóstico. */
function gy_email_registrar_falha(array $resultado): void
{
    $registro = '[FALHA ' . ($resultado['motor'] ?? '?') . '] ' . ($resultado['erro'] ?? 'sem detalhe') . "\n---\n";
    @file_put_contents(__DIR__ . '/api/mail.log', $registro, FILE_APPEND);
}
