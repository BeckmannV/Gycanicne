<?php
/**
 * Controle de sessão usado pelas páginas.
 * É carregado automaticamente pelo includes/topo.php.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/** Verdadeiro quando existe um usuário autenticado na sessão. */
function gy_logado(): bool
{
    return isset($_SESSION['usuario_id']);
}

/** Nome do usuário logado (ou "Visitante"). */
function gy_usuario_nome(): string
{
    return (string) ($_SESSION['usuario_nome'] ?? 'Visitante');
}

/**
 * Bloqueia a página para visitantes não autenticados.
 * Evita que o HTML protegido seja entregue antes do redirecionamento do JavaScript.
 */
function gy_exigir_login(): void
{
    if (!gy_logado()) {
        header('Location: login.php');
        exit;
    }
}
