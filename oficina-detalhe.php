<?php
/** Página: Oficina. */
$titulo = 'Oficina';
$ativo  = 'oficinas';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <!-- Resumo da oficina (preenchido pelo main.js) e atalhos. -->
        <header class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p class="text-warning text-uppercase fw-semibold small mb-1">Visão geral</p>
            <h1 class="h2 fw-bold mb-0">Minha oficina</h1>
          </div>
          <a href="oficinas.php" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Voltar</a>
        </header>

        <div class="card bg-dark border-secondary rounded-4 overflow-hidden position-relative mb-4">
          <img src="public/banners/oficina.jpg" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
          <div class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-75"></div>
          <div class="card-body position-relative z-2 p-4 p-lg-5">
            <p class="text-warning text-uppercase fw-semibold small mb-1">Unidade principal</p>
            <h2 class="display-6 fw-bold mb-2" data-oficina-nome>Pronta para configurar</h2>
            <p class="text-white-50 mb-0" data-oficina-info>
              Inclua os dados da sua oficina para visualizar as informações aqui.
            </p>
          </div>
        </div>        <div class="row g-3">
          <div class="col-md-4">
            <a href="servicos-lista.php" class="card bg-dark border-secondary rounded-4 h-100 text-decoration-none overflow-hidden">
              <img src="public/banners/tile-servicos.jpg" alt="" class="w-100 object-fit-cover" height="120" />
              <div class="card-body p-4">
                <i class="bi bi-list-check display-6 text-warning"></i>
                <h3 class="h5 fw-bold mt-3 mb-1">Serviços</h3>
                <p class="text-secondary small mb-0">Acompanhe as ordens de serviço em andamento.</p>
              </div>
              <div class="card-footer bg-transparent border-secondary small fw-semibold text-warning">
                Gerenciar serviços <i class="bi bi-arrow-right"></i>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a href="funcionarios.php" class="card bg-dark border-secondary rounded-4 h-100 text-decoration-none overflow-hidden">
              <img src="public/banners/tile-equipe.jpg" alt="" class="w-100 object-fit-cover" height="120" />
              <div class="card-body p-4">
                <i class="bi bi-people display-6 text-warning"></i>
                <h3 class="h5 fw-bold mt-3 mb-1">Equipe</h3>
                <p class="text-secondary small mb-0">Veja e gerencie quem faz parte da operação.</p>
              </div>
              <div class="card-footer bg-transparent border-secondary small fw-semibold text-warning">
                Ver funcionários <i class="bi bi-arrow-right"></i>
              </div>
            </a>
          </div>
          <div class="col-md-4">
            <a href="perfil.php" class="card bg-dark border-secondary rounded-4 h-100 text-decoration-none overflow-hidden">
              <img src="public/banners/tile-config.jpg" alt="" class="w-100 object-fit-cover" height="120" />
              <div class="card-body p-4">
                <i class="bi bi-gear display-6 text-warning"></i>
                <h3 class="h5 fw-bold mt-3 mb-1">Configurações</h3>
                <p class="text-secondary small mb-0">Ajuste seus dados de acesso e preferências.</p>
              </div>
              <div class="card-footer bg-transparent border-secondary small fw-semibold text-warning">
                Abrir perfil <i class="bi bi-arrow-right"></i>
              </div>
            </a>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
