<?php
/** Página: Acompanhamento de serviço. */
$titulo = 'Acompanhamento de serviço';
$ativo  = 'servicos';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <!-- Acompanhamento de um serviço: cliente, veículo, trabalho e problemas. -->
        <header class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p class="text-warning text-uppercase fw-semibold small mb-1">Acompanhamento</p>
            <h1 class="h2 fw-bold mb-1">Serviço em andamento</h1>
            <p class="text-secondary mb-0">
              Acompanhe o atendimento do começo ao fim: cliente, veículo,
              equipe e cada problema identificado.
            </p>
          </div>
          <div class="d-flex gap-2">
            <a href="adicionar-servico.php" class="btn btn-success"><i class="bi bi-plus-lg"></i> Nova OS</a>
            <a href="oficina-detalhe.php" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Oficina</a>
          </div>
        </header>
        <!-- Identidade do serviço -->
        <div class="card bg-dark border-secondary rounded-4 mb-4">
          <div class="card-body p-4">
            <span class="badge text-bg-warning mb-3" data-service-status>Em andamento</span>
            <div class="row g-3 align-items-end">
              <div class="col-md-6 col-lg-4">
                <label for="select-os" class="form-label small text-secondary">Serviço</label>
                <select id="select-os" data-select-os class="form-select">
                  <option value="">Carregando…</option>
                </select>
              </div>
              <div class="col-md-6 col-lg-8">
                <h2 class="h4 fw-bold mb-1" data-service-title>SUV preto — falha intermitente</h2>
                <p class="text-secondary small mb-0">
                  <i class="bi bi-file-text"></i> OS nº <span data-svc-num>—</span>
                  <i class="bi bi-calendar ms-3"></i> Início em <span data-svc-inicio>—</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado sem nenhuma OS registrada -->
        <div class="text-center text-secondary py-5 my-4 d-none" data-service-empty>
          <i class="bi bi-clipboard display-6 text-warning"></i>
          <h3 class="h5 fw-bold text-white mt-3">Nenhum serviço ativo</h3>
          <p class="mb-3">Abra uma nova ordem de serviço para começar o acompanhamento.</p>
          <a href="adicionar-servico.php" class="btn btn-success"><i class="bi bi-plus-lg"></i> Nova OS</a>
        </div>

        <!-- Cliente, veículo, trabalho e equipe -->
        <div class="row g-3 mb-4 d-none" data-svc-content>
          <div class="col-md-6 col-xl-3">
            <article class="card bg-dark border-secondary rounded-4 h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-3 text-bg-warning p-2"><i class="bi bi-person-circle"></i></span>
                  <h3 class="h6 fw-bold mb-0">Cliente</h3>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-circle text-bg-secondary p-3 fw-bold" data-svc-cliente-avatar data-avatar-size="56"></span>
                  <div>
                    <p class="fw-semibold mb-1" data-svc-cliente>Carlos Andrade</p>
                    <p class="text-secondary small mb-0"><i class="bi bi-telephone"></i> <span data-svc-cliente-tel>(11) 98877-1122</span></p>
                    <p class="text-secondary small mb-0"><i class="bi bi-envelope"></i> <span data-svc-cliente-email>carlos.andrade@email.com</span></p>
                  </div>
                </div>
              </div>
            </article>
          </div>          <div class="col-md-6 col-xl-3">
            <article class="card bg-dark border-secondary rounded-4 h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-3 text-bg-warning p-2"><i class="bi bi-car-front"></i></span>
                  <h3 class="h6 fw-bold mb-0">Veículo</h3>
                </div>
                <img data-svc-veiculo-img alt="" loading="lazy" hidden />
                <p class="fw-semibold mb-1" data-svc-veiculo>Suzuki Vitara 2022</p>
                <p class="text-secondary small mb-0"><i class="bi bi-tag"></i> <span data-svc-placa>GRO-7B22</span></p>
                <p class="text-secondary small mb-0"><i class="bi bi-palette"></i> Preto · <span data-svc-ano>2022</span></p>
              </div>
            </article>
          </div>
          <div class="col-md-6 col-xl-3">
            <article class="card bg-dark border-secondary rounded-4 h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-3 text-bg-warning p-2"><i class="bi bi-wrench"></i></span>
                  <h3 class="h6 fw-bold mb-0">Trabalho</h3>
                </div>
                <p class="fw-semibold mb-1" data-svc-servico>Diagnóstico + reparo elétrico</p>
                <p class="text-secondary small mb-0"><i class="bi bi-clock"></i> Serviço contratado</p>
              </div>
            </article>
          </div>
          <div class="col-md-6 col-xl-3">
            <article class="card bg-dark border-secondary rounded-4 h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center gap-2 mb-3">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-3 text-bg-warning p-2"><i class="bi bi-person"></i></span>
                  <h3 class="h6 fw-bold mb-0">Responsável</h3>
                </div>
                <p class="fw-semibold mb-1" data-svc-func>Marcos Rocha</p>
                <p class="text-secondary small mb-0"><i class="bi bi-briefcase"></i> Mecânico eletricista</p>
                <p class="text-secondary small mb-0"><i class="bi bi-star text-warning"></i> Conduzindo o atendimento</p>
              </div>
            </article>
          </div>
        </div>
        <!-- Lista de problemas identificados -->
        <div class="card bg-dark border-secondary rounded-4 d-none" data-svc-problems>
          <div class="card-header bg-transparent border-secondary d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">
            <h3 class="h6 fw-bold mb-0"><i class="bi bi-exclamation-circle text-warning"></i> Problemas identificados</h3>
            <button type="button" class="btn btn-sm btn-warning" data-add-problem>
              <i class="bi bi-plus-lg"></i> Novo problema
            </button>
          </div>
          <div class="card-body p-4">
            <!-- Formulário de novo problema / edição (exibido pelo main.js). -->
            <form class="card bg-black border-secondary mb-3 p-3 d-none" data-problem-form>
              <input type="hidden" data-problem-edit-id value="" />
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="novo-titulo" class="form-label">Título</label>
                    <input
                      class="form-control"
                      type="text"
                      id="novo-titulo"
                      name="titulo"
                      placeholder="Ex.: Barulho ao frear"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="novo-descricao" class="form-label">Descrição</label>
                    <input
                      class="form-control"
                      type="text"
                      id="novo-descricao"
                      name="descricao"
                      placeholder="Detalhes do problema (opcional)"
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="novo-status" class="form-label">Status</label>
                    <select class="form-select" id="novo-status" name="status" data-problem-status>
                      <option value="em_analise">Em análise</option>
                      <option value="aguardando">Aguardando</option>
                      <option value="resolvido">Resolvido</option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-success" type="submit">
                  <i class="bi bi-check-lg"></i> <span data-problem-submit-label>Adicionar</span>
                </button>
                <button class="btn btn-outline-secondary" type="button" data-cancel-problem>
                  Cancelar
                </button>
              </div>
            </form>
            <ul class="list-group list-group-flush" data-problem-list></ul>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
