<?php
/** Página: Novo serviço. */
$titulo = 'Novo serviço';
$ativo  = 'servicos';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <header class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
          <div>
            <p class="text-warning text-uppercase fw-semibold small mb-1">Nova OS</p>
            <h1 class="h2 fw-bold mb-1">Registrar serviço</h1>
            <p class="text-secondary mb-0">
              Abra a ordem de serviço com o cliente, o veículo e o responsável
              pelo atendimento.
            </p>
          </div>
          <a href="servicos.php" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Voltar</a>
        </header>        <div class="card bg-dark border-secondary rounded-4">
          <div class="card-body p-4">
            <!-- Salva a OS no banco pelo backend PHP e vai para o acompanhamento. -->
            <form action="api.php?acao=adicionar-servico" method="post">
              <section class="mb-4">
                <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                  <i class="bi bi-car-front"></i> Serviço
                </h3>
                <div class="row">
                  <div class="col-12">
                    <div class="mb-3">
                      <label for="titulo" class="form-label">Título do serviço</label>
                      <input
                        class="form-control"
                        type="text"
                        id="titulo"
                        name="titulo"
                        placeholder="Ex.: SUV preto com falha ao acelerar"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="mb-3">
                      <label for="servico" class="form-label">Trabalho atribuído</label>
                      <input
                        class="form-control"
                        type="text"
                        id="servico"
                        name="servico"
                        placeholder="Ex.: Diagnóstico + reparo elétrico"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section class="mb-4">
                <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                  <i class="bi bi-person-circle"></i> Cliente
                </h3>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="cliente" class="form-label">Nome do cliente</label>
                      <input
                        class="form-control"
                        type="text"
                        id="cliente"
                        name="cliente"
                        placeholder="Nome completo"
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="cliente_telefone" class="form-label">Telefone / WhatsApp</label>
                      <input
                        class="form-control"
                        type="tel"
                        id="cliente_telefone"
                        name="cliente_telefone"
                        placeholder="(11) 99999-9999"
                        data-mask-phone
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="cliente_email" class="form-label">E-mail</label>
                      <input
                        class="form-control"
                        type="email"
                        id="cliente_email"
                        name="cliente_email"
                        placeholder="cliente@email.com"
                      />
                    </div>
                  </div>
                </div>
              </section>
              <section class="mb-4">
                <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                  <i class="bi bi-truck"></i> Veículo
                </h3>
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="fipe-marca" class="form-label">Marca</label>
                      <select
                        class="form-select"
                        id="fipe-marca"
                        name="veiculo_marca"
                        data-fipe-marca
                      >
                        <option value="">Carregando marcas…</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="fipe-modelo" class="form-label">Modelo</label>
                      <input
                        class="form-control"
                        type="text"
                        id="fipe-modelo"
                        name="veiculo_modelo"
                        data-fipe-modelo
                        list="fipe-modelos-list"
                        autocomplete="off"
                        placeholder="Selecione a marca primeiro…"
                        disabled
                      />
                      <datalist id="fipe-modelos-list"></datalist>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="fipe-ano" class="form-label">Ano</label>
                      <select
                        class="form-select"
                        id="fipe-ano"
                        name="veiculo_ano"
                        data-fipe-ano
                        disabled
                      >
                        <option value="">Selecione o modelo primeiro…</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label for="placa" class="form-label">Placa</label>
                      <input
                        class="form-control"
                        type="text"
                        id="placa"
                        name="placa"
                        placeholder="ABC-1234"
                        maxlength="8"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="mb-3">
                      <label for="cor" class="form-label">Cor</label>
                      <input
                        class="form-control"
                        type="text"
                        id="cor"
                        name="cor"
                        placeholder="Ex.: Preto"
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="funcionario_id" class="form-label">Responsável pelo serviço</label>
                      <select class="form-select" id="funcionario_id" name="funcionario_id">
                        <option value="0">— Sem responsável —</option>
                      </select>
                    </div>
                  </div>
                </div>
                <!-- Painel "Seu veículo" (exibido pelo main.js após a consulta FIPE). -->
                <div class="card bg-black border-secondary rounded-4 mb-3 d-none" data-veiculo-painel>
                  <div class="card-body d-flex align-items-center gap-3 flex-wrap">
                    <img
                      class="rounded object-fit-cover"
                      data-veiculo-img
                      alt=""
                      loading="lazy"
                      width="220"
                      height="137"
                    />
                    <div class="spinner-border text-warning" role="status" data-veiculo-loading hidden>
                      <span class="visually-hidden">Carregando…</span>
                    </div>
                    <div class="flex-grow-1">
                      <p class="text-warning text-uppercase fw-semibold small mb-1">Seu veículo</p>
                      <h4 class="h5 fw-bold mb-2" data-veiculo-nome>—</h4>
                      <p class="text-secondary small mb-1"><i class="bi bi-tag"></i> <span data-veiculo-preco>—</span></p>
                      <p class="text-secondary small mb-1"><i class="bi bi-upc-scan"></i> <span data-veiculo-fipe>—</span></p>
                      <p class="text-secondary small mb-0"><i class="bi bi-calendar3"></i> <span data-veiculo-ref>—</span></p>
                    </div>
                  </div>
                </div>

                <input type="hidden" id="veiculo" name="veiculo" data-veiculo-resumo />
                <input type="hidden" id="veiculo_marca_id" name="veiculo_marca_id" data-veiculo-marca-id />
                <input type="hidden" id="veiculo_modelo_id" name="veiculo_modelo_id" data-veiculo-modelo-id />
                <input type="hidden" name="veiculo_ano_id" data-veiculo-ano-id />
                <input type="hidden" name="ano" data-veiculo-ano-num />
              </section>

              <div class="d-flex gap-2">
                <button class="btn btn-success" type="submit">
                  <i class="bi bi-check-lg"></i> Abrir serviço</button>
                <a href="servicos.php" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
