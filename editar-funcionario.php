<?php
/** Página: Editar usuário. */
$titulo = 'Editar usuário';
$ativo  = 'funcionarios';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <header class="mb-4">
          <p class="text-warning text-uppercase fw-semibold small mb-1">Edição de equipe</p>
          <h1 class="h2 fw-bold mb-1">Editar usuário</h1>
          <p class="text-secondary mb-0">
            Atualize os dados do usuário selecionado e salve as mudanças.
          </p>
        </header>
        <div class="card bg-dark border-secondary rounded-4">
          <div class="card-body p-4">
            <!-- Mensagens de retorno (controladas pelo main.js). -->
            <div id="edit-alert" role="alert"></div>
            <!-- Salva os dados via backend/editar-funcionario.php (fetch do main.js). -->
            <form id="edit-form">              <section class="mb-4">
                <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                  <i class="bi bi-person"></i> Identificação
                </h3>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-nome" class="form-label">Nome completo</label>
                      <input class="form-control" type="text" id="edit-nome" name="nome" placeholder="Nome do usuário" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-email" class="form-label">E-mail</label>
                      <input class="form-control" type="email" id="edit-email" name="email" placeholder="nome@empresa.com" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-data" class="form-label">Data de nascimento</label>
                      <input class="form-control" type="date" id="edit-data" name="data_nascimento" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-cargo" class="form-label">Nível de acesso</label>
                      <select class="form-select" id="edit-cargo" name="cargo" required>
                        <option value="funcionario">Funcionário</option>
                        <option value="gerente">Gerente</option>
                        <option value="usuario">Usuário</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              <section class="mb-4">
                <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                  <i class="bi bi-telephone"></i> Contato e função
                </h3>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-funcao" class="form-label">Função na oficina</label>
                      <input class="form-control" type="text" id="edit-funcao" name="funcao" placeholder="Ex.: Mecânico eletricista" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-telefone" class="form-label">Telefone / WhatsApp</label>
                      <input class="form-control" type="tel" id="edit-telefone" name="telefone" placeholder="(11) 99999-9999" data-mask-phone />
                    </div>
                  </div>
                </div>
              </section>
              <section class="mb-4">
                <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                  <i class="bi bi-geo-alt"></i> Endereço
                </h3>
                <div class="row">
                  <div class="col-md-8">
                    <div class="mb-3">
                      <label for="edit-endereco" class="form-label">Endereço</label>
                      <input class="form-control" type="text" id="edit-endereco" name="endereco" placeholder="Rua, número, bairro" />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label for="edit-cep" class="form-label">CEP</label>
                      <input class="form-control" type="text" id="edit-cep" name="cep" placeholder="00000-000" inputmode="numeric" data-mask-cep />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-cidade" class="form-label">Cidade</label>
                      <input class="form-control" type="text" id="edit-cidade" name="cidade" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="edit-uf" class="form-label">UF</label>
                      <input class="form-control" type="text" id="edit-uf" name="uf" maxlength="2" placeholder="SP" />
                    </div>
                  </div>
                </div>
              </section>

              <div class="d-flex gap-2">
                <button class="btn btn-success" type="submit">
                  <i class="bi bi-check-lg"></i> Salvar alterações
                </button>
                <a href="funcionarios.php" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
