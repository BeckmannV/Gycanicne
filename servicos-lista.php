<?php
/** Página: Serviços. */
$titulo = 'Serviços';
$ativo  = 'servicos';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <!-- Lista das ordens de serviço: abrir ou remover (itens via main.js). -->
        <header class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p class="text-warning text-uppercase fw-semibold small mb-1">Minha oficina</p>
            <h1 class="h2 fw-bold mb-0">Serviços</h1>
            <p class="text-secondary mb-0">
              Gerencie as ordens de serviço: abra uma nova, acompanhe ou
              remova as que não forem mais necessárias.
            </p>
          </div>
          <div class="d-flex gap-2">
            <a href="adicionar-servico.php" class="btn btn-success"><i class="bi bi-plus-lg"></i> Nova OS</a>
            <a href="oficina-detalhe.php" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Oficina</a>
          </div>
        </header>

        <div class="card bg-dark border-secondary rounded-4 overflow-hidden">
          <ul class="list-group list-group-flush" data-svc-list>
            <li class="list-group-item text-secondary">Carregando…</li>
          </ul>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
