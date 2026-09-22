<?php
/** Página: Gestão inteligente. */
$titulo = 'Gestão inteligente';
$ativo  = 'index';
$protegida = false;
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <div class="alert alert-warning d-none" data-login-alert></div>
        <header class="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
          <div>
            <p class="text-warning text-uppercase fw-semibold small mb-0">Painel</p>
            <span class="fs-5 fw-semibold" id="gy-topbar-name">Início</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <a class="btn btn-outline-warning btn-sm rounded-pill px-3" href="oficinas.php"><i class="bi bi-wrench"></i> Oficinas</a>
            <a class="text-decoration-none" href="perfil.php">
              <span id="gy-topbar-avatar" class="d-inline-flex align-items-center justify-content-center rounded-circle gy-topbar-avatar p-2">?</span>
            </a>
          </div>
        </header>

        <section class="card bg-dark border-secondary rounded-4 overflow-hidden position-relative mb-5">
          <img src="public/banners/hero.jpg" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
          <div class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75"></div>
          <div class="card-body position-relative z-2 p-4 p-lg-5">
            <p class="text-warning text-uppercase fw-semibold small mb-2">Gestão de oficinas, sem ruído</p>
            <h1 class="display-4 fw-bold mb-3 text-warning" data-hero-title>Seu negócio mecânico <span class="text-accent">em perfeito funcionamento.</span></h1>
            <p class="lead text-white-50 mb-4">
              Organize sua oficina, acompanhe a equipe e deixe cada atendimento
              mais simples, profissional e <span class="text-warning">eficiente.</span>
            </p>
            <div class="d-flex gap-2 flex-wrap" id="home-hero-actions">
              <a class="btn btn-warning fw-semibold px-4" href="cadastro.php">Criar conta grátis</a>
              <a class="btn btn-default-gy px-4" href="login.php">Entrar</a>
            </div>
          </div>
        </section>
        <div class="row gy-stats-row mb-5">
          <div class="col-md-4 ps-4 py-4">
            <i class="bi bi-wrench text-warning"></i>
            <strong class="fs-3 fw-semibold d-block mt-2" data-stat-oficinas>—</strong>
            <span class="small text-white-50 gy-stat-underline d-block">Oficinas cadastradas</span>
          </div>
          <div class="col-md-4 ps-4 py-4">
            <i class="bi bi-people text-warning"></i>
            <strong class="fs-3 fw-semibold d-block mt-2" data-stat-usuarios>—</strong>
            <span class="small text-secondary gy-stat-underline d-block">Usuários da plataforma</span>
          </div>
          <div class="col-md-4 ps-4 py-4">
            <i class="bi bi-star text-warning"></i>
            <strong class="fs-3 fw-semibold d-block mt-2" data-stat-minhas>—</strong>
            <span class="small text-white-50 gy-stat-underline d-block">Oficinas da sua equipe</span>
          </div>
        </div>

        <section data-home-dash hidden class="pb-4">
          <div class="d-flex gap-2 flex-wrap mb-4">
            <a class="btn btn-warning fw-semibold" href="adicionar-servico.php"><i class="bi bi-plus-lg"></i> Nova ordem de serviço</a>
            <a class="btn btn-outline-light" href="servicos.php"><i class="bi bi-list-ul"></i> Meus serviços</a>
          </div>
          <div class="card bg-dark border-secondary rounded-4">
            <div class="card-header bg-transparent border-secondary d-flex align-items-center gap-2 py-3">
              <span class="d-inline-flex align-items-center justify-content-center rounded-3 text-bg-warning p-2"><i class="bi bi-clock-history"></i></span>
              <h3 class="h6 fw-bold mb-0">Serviços recentes</h3>
            </div>
            <ul class="list-group list-group-flush" data-recent-os>
              <li class="list-group-item text-secondary">Carregando…</li>
            </ul>
          </div>
        </section>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
