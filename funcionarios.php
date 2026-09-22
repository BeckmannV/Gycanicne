<?php
/** Página: Funcionários. */
$titulo = 'Funcionários';
$ativo  = 'funcionarios';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <header class="mb-4">
          <p class="text-warning text-uppercase fw-semibold small mb-1">Sua equipe</p>
          <h1 class="h2 fw-bold mb-1">Funcionários</h1>
          <p class="text-secondary mb-0">
            Cadastre novos funcionários e acompanhe quem faz parte da equipe.
          </p>
        </header>
      <!-- Visível apenas para gerentes (controlado pelo main.js). -->
      <div class="card bg-dark border-secondary rounded-4 mb-4 d-none" data-admin-only>
        <div class="card-body p-4">
          <h2 class="h5 fw-bold"><i class="bi bi-person-plus text-warning"></i> Cadastrar funcionário</h2>
          <!-- Salva os dados do novo funcionário no PHP. -->
          <form action="api.php?acao=adicionar-funcionario" method="post" class="mt-3">
            <section class="mb-4">
              <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                <i class="bi bi-person"></i> Identificação
              </h3>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="nome" class="form-label">Nome completo</label>
                    <input class="form-control" type="text" id="nome" name="nome" placeholder="Nome do funcionário" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input class="form-control" type="email" id="email" name="email" placeholder="nome@empresa.com" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="telefone" class="form-label">Telefone / WhatsApp</label>
                    <input class="form-control" type="tel" id="telefone" name="telefone" placeholder="(11) 99999-9999" data-mask-phone />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="data_nascimento" class="form-label">Data de nascimento</label>
                    <input class="form-control" type="date" id="data_nascimento" name="data_nascimento" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="funcao" class="form-label">Função na oficina</label>
                    <input class="form-control" type="text" id="funcao" name="funcao" placeholder="Ex.: Mecânico eletricista" />
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
                    <label for="endereco" class="form-label">Endereço</label>
                    <input class="form-control" type="text" id="endereco" name="endereco" placeholder="Rua, número, bairro" />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="cep" class="form-label">CEP</label>
                    <input class="form-control" type="text" id="cep" name="cep" placeholder="00000-000" inputmode="numeric" data-mask-cep />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="cidade" class="form-label">Cidade</label>
                    <input class="form-control" type="text" id="cidade" name="cidade" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="uf" class="form-label">UF</label>
                    <input class="form-control" type="text" id="uf" name="uf" maxlength="2" placeholder="SP" />
                  </div>
                </div>
              </div>
            </section>
            <section class="mb-4">
              <h3 class="h6 text-uppercase text-secondary fw-semibold mb-3">
                <i class="bi bi-shield-lock"></i> Acesso
              </h3>
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="senha" class="form-label">Senha inicial</label>
                    <input class="form-control" type="password" id="senha" name="senha" minlength="6" placeholder="Mínimo 6 caracteres" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="cargo" class="form-label">Nível de acesso</label>
                    <select class="form-select" id="cargo" name="cargo" required>
                      <option value="funcionario">Funcionário</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <div class="d-flex gap-2">
              <button class="btn btn-success" type="submit">
                <i class="bi bi-person-plus-fill"></i> Cadastrar funcionário
              </button>
            </div>
          </form>
        </div>
      </div>
      <!-- Filtros + listagem da equipe (preenchidos pelo main.js). -->
      <div class="card bg-dark border-secondary rounded-4 overflow-hidden">
        <ul class="nav nav-tabs card-header-tabs px-3 pt-2" role="tablist">
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link active is-active" data-tab-btn="todos">
              <i class="bi bi-people"></i> Todos os usuários
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link" data-tab-btn="gerente">
              <i class="bi bi-person-badge"></i> Gerentes
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button type="button" class="nav-link" data-tab-btn="funcionario">
              <i class="bi bi-person"></i> Funcionários
            </button>
          </li>
        </ul>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-5 col-lg-4">
              <label class="visually-hidden" for="busca-funcionario">Buscar funcionário</label>
              <input
                class="form-control"
                type="search"
                id="busca-funcionario"
                placeholder="Buscar por nome, e-mail ou função"
                data-search-func
              />
            </div>
          </div>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead>
                <tr>
                  <th></th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Função</th>
                  <th>Telefone</th>
                  <th>Cargo</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody data-employee-grid>
                <tr>
                  <td colspan="8" class="text-center text-secondary py-5">Carregando…</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
