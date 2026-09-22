<?php
/** Página: Nova oficina. */
$titulo = 'Nova oficina';
$ativo  = 'oficinas';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <header class="mb-4">
          <p class="text-warning text-uppercase fw-semibold small mb-1">Nova unidade</p>
          <h1 class="h2 fw-bold mb-1">Adicionar oficina</h1>
          <p class="text-secondary mb-0">
            Preencha os dados essenciais para começar a organizar a operação.
          </p>
        </header>
        <div class="card bg-dark border-secondary rounded-4">
          <div class="card-body p-4">
            <!-- Salva os dados no banco por meio do backend PHP. -->
            <form action="api.php?acao=adicionar-oficina" method="post">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="nome-oficina" class="form-label">Nome da oficina</label>
                    <input
                      class="form-control"
                      id="nome-oficina"
                      name="nome-oficina"
                      placeholder="Ex.: Gycanic Motors"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="email-instituicao" class="form-label">E-mail profissional</label>
                    <input
                      class="form-control"
                      type="email"
                      id="email-instituicao"
                      name="email-instituicao"
                      placeholder="contato@oficina.com"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="cep" class="form-label">CEP</label>
                    <input
                      class="form-control"
                      id="cep" data-mask-cep
                      name="cep"
                      placeholder="00000-000"
                      inputmode="numeric"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="documento" class="form-label">CNPJ ou CPF do responsável</label>
                    <input
                      class="form-control"
                      id="documento" data-mask-documento
                      name="documento"
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2 mt-3">
                <button class="btn btn-success" type="submit">
                  <i class="bi bi-check-lg"></i> Salvar oficina</button>
                <a href="oficinas.php" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
