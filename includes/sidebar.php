<?php
/**
 * Menu lateral compartilhado por todas as páginas internas.
 *
 * Variáveis esperadas (definidas pelo includes/topo.php):
 *   $ativo      — slug do item que deve aparecer destacado
 *   $menuLogout — true para mostrar o botão "Sair" (páginas protegidas)
 */

$gyMenu = [
    'index'        => ['index.php', 'bi-house-door', 'Início'],
    'oficinas'     => ['oficinas.php', 'bi-wrench', 'Oficinas'],
    'funcionarios' => ['funcionarios.php', 'bi-people', 'Funcionários'],
    'servicos'     => ['servicos-lista.php', 'bi-wrench', 'Serviços'],
    'perfil'       => ['perfil.php', 'bi-person', 'Perfil'],
];

$gyAtivo  = 'bg-warning text-white fw-semibold';
$gyNormal = 'text-white-50';
?>
    <aside class="d-flex flex-column flex-shrink-0 p-3 border-end border-secondary gy-sidebar col-md-3 col-lg-2">
      <a href="index.php" class="fs-4 fw-bolder text-decoration-none text-white d-flex align-items-center mb-3">
        <span class="text-warning">Gy</span>canic
      </a>
      <ul class="nav flex-column gap-1">
<?php foreach ($gyMenu as $gySlug => [$gyUrl, $gyIcone, $gyRotulo]): ?>
        <li class="nav-item">
          <a class="nav-link d-flex align-items-center gap-2 rounded-3 px-3 py-2 <?= $gySlug === $ativo ? $gyAtivo : $gyNormal ?>" href="<?= $gyUrl ?>"><i class="bi <?= $gyIcone ?>"></i> <?= $gyRotulo ?></a>
        </li>
<?php endforeach; ?>
      </ul>
      <div class="mt-auto<?= $menuLogout ? ' pt-3' : '' ?>">
<?php if ($menuLogout): ?>
        <a href="login.php" data-logout class="btn btn-warning w-100"><i class="bi bi-box-arrow-right"></i> Sair</a>
<?php else: ?>
        <div id="sidebar-actions-container"></div>
        <div class="d-flex align-items-center gap-2 mt-3 border border-secondary rounded-3 p-2" data-sidebar-user>
          <span class="d-inline-flex align-items-center justify-content-center rounded-circle gy-topbar-avatar p-2 fw-bold" data-sidebar-user-avatar data-avatar-size="40">?</span>
          <div class="lh-sm">
            <strong class="small d-block" data-sidebar-user-name>Visitante</strong>
            <span class="text-secondary small" data-sidebar-user-role>Não conectado</span>
          </div>
        </div>
<?php endif; ?>
      </div>
    </aside>
