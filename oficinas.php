<?php
/** Página: Oficinas. */
$titulo = 'Oficinas';
$ativo  = 'oficinas';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <header class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p class="text-warning text-uppercase fw-semibold small mb-1">Sua operação</p>
            <h1 class="h2 fw-bold mb-1">Oficinas</h1>
            <p class="text-secondary mb-0">
              Encontre, acompanhe e administre suas unidades em um único lugar.
            </p>
          </div>
          <a href="adicionar-oficina.php" class="btn btn-success"><i class="bi bi-plus-lg"></i> Nova oficina</a>
        </header>        <div class="card bg-dark border-secondary rounded-4 overflow-hidden">
          <ul class="nav nav-tabs card-header-tabs px-3 pt-2" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" type="button" role="tab" data-bs-toggle="tab" data-bs-target="#minhas-pane">Minhas oficinas</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" type="button" role="tab" data-bs-toggle="tab" data-bs-target="#disponiveis-pane">Disponíveis</button>
            </li>
          </ul>
          <div class="card-body">
            <div class="tab-content">
              <!-- Esta grade é preenchida pelo JavaScript com dados do PHP. -->
              <div class="tab-pane fade show active" id="minhas-pane">
                <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3" data-office-grid></div>
              </div>
              <div class="tab-pane fade" id="disponiveis-pane">
                <div class="text-center text-secondary py-5 my-4">
                  <i class="bi bi-search display-6 text-warning"></i>
                  <p class="mt-3 mb-0">As oficinas públicas aparecerão aqui em breve.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
