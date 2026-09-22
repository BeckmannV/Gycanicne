<?php
/** Página: Criar conta. */
$titulo = 'Criar conta';
$ativo  = '';
$protegida = false;
$menu = false;
require __DIR__ . '/includes/topo.php';
?>
      <div class="container">
        <div class="row g-0 justify-content-center rounded-4 overflow-hidden shadow border border-secondary">
          <section class="col-md-7 col-lg-6 p-4 p-lg-5 bg-dark">
            <a href="index.php" class="fs-3 fw-bolder text-decoration-none text-white">
              <span class="text-warning">Gy</span>canic</a>
            <p class="text-warning text-uppercase fw-semibold small mt-4 mb-1">Comece agora</p>
            <h1 class="h3 fw-bold">Crie sua conta</h1>
            <p class="text-secondary">
              Leva menos de um minuto para iniciar sua gestão.
            </p>
            <!-- Dados enviados ao PHP responsável pelo cadastro. -->
            <form
              action="backend/cadastro.php"
              method="post"
              class="mt-4"
              data-validate-senha
            >
              <div class="mb-3">
                <label for="nome" class="form-label">Seu nome</label>
                <input
                  class="form-control"
                  type="text"
                  id="nome"
                  name="nome"
                  autocomplete="name"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">E-mail</label>
                <input
                  class="form-control"
                  type="email"
                  id="email"
                  name="email"
                  autocomplete="email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="senha" class="form-label">Senha</label>
                <input
                  class="form-control"
                  type="password"
                  id="senha"
                  name="senha"
                  minlength="6"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="confirmar-senha" class="form-label">Confirme a senha</label>
                <input
                  class="form-control"
                  type="password"
                  id="confirmar-senha"
                  name="confirmar-senha"
                  minlength="6"
                  required
                />
              </div>
              <div class="d-none" id="cadastro-alert"></div>
              <button class="btn btn-warning fw-semibold" type="submit">
                Criar minha conta <i class="bi bi-arrow-right"></i>
              </button>
            </form>
            <p class="mt-3 mb-0 text-secondary small">
              Já possui acesso?
              <a href="login.php" class="link-warning text-decoration-none">Entrar na conta</a>
            </p>
          </section>
          <aside class="col-md-5 d-none d-md-flex align-items-center p-4 p-lg-5 position-relative overflow-hidden text-white">
            <img src="public/banners/auth.jpg" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
            <div class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50"></div>
            <div class="position-relative z-2">
              <p class="fw-semibold small text-uppercase mb-2 text-warning">Tudo em um só lugar</p>
              <h2 class="h3 fw-bold">Mais tempo para cuidar dos seus clientes.</h2>
              <p class="mb-0">
                Organize as rotinas da oficina com uma experiência direta e
                agradável.
              </p>
            </div>
          </aside>
        </div>
      </div>
<?php require __DIR__ . "/includes/rodape.php"; ?>
