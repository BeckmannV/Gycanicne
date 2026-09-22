<?php
/**
 * Topo comum de todas as páginas (cabeçalho + menu lateral).
 *
 * Cada página define as variáveis abaixo antes de incluir este arquivo:
 *   $titulo    — texto exibido na aba do navegador (obrigatório)
 *   $ativo     — slug do item do menu a destacar (padrão: nenhum)
 *   $menu      — false nas telas sem menu lateral (login e cadastro)
 *   $protegida — false nas telas públicas (login, cadastro e início)
 */

require_once __DIR__ . '/auth.php';

$titulo    = $titulo ?? 'Gycanic';
$ativo     = $ativo ?? '';
$menu      = $menu ?? true;
$protegida = $protegida ?? true;

// Páginas internas só são entregues para quem está autenticado.
if ($protegida) {
    gy_exigir_login();
}

$menuLogout = $protegida;
$classeBody = $menu ? 'd-flex flex-column flex-md-row bg-body' : 'bg-body';
$classeMain = $menu ? 'flex-grow-1 min-vh-100' : 'min-vh-100 d-flex align-items-center py-5';
?>
<!doctype html>
<html lang="pt-BR" data-bs-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Gycanic | <?= htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link href="css/style.css" rel="stylesheet" />
  </head>
  <body class="<?= $classeBody ?>"<?= $protegida ? ' data-protected-page' : '' ?>>
<?php if ($menu) { require __DIR__ . '/sidebar.php'; } ?>
    <main class="<?= $classeMain ?>">
