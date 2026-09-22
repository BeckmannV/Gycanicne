<?php
/** Página: Entrar. */
$titulo = 'Entrar';
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
            <p class="text-warning text-uppercase fw-semibold small mt-4 mb-1">Bem-vindo de volta</p>
            <h1 class="h3 fw-bold">Entre na sua conta</h1>
            <p class="text-secondary">
              Acompanhe sua operação e deixe a gestão da oficina mais leve.
            </p>
            <!-- Envia as credenciais para o PHP, que cria a sessão. -->
            <form action="backend/login.php" method="post" class="mt-4">
              <div class="alert alert-danger d-none" data-login-error></div>
              <div class="mb-3">
                <label for="email" class="form-label">E-mail</label>
                <input
                  class="form-control"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="voce@exemplo.com"
                  required
                  autofocus
                />
              </div>
              <div class="mb-3">
                <label for="senha" class="form-label">Senha</label>
                <input
                  class="form-control"
                  type="password"
                  id="senha"
                  name="senha"
                  placeholder="Sua senha"
                  required
                />
              </div>
              <button class="btn btn-warning fw-semibold d-inline-flex align-items-center justify-content-center" type="submit">
                <span>Entrar</span> <i class="bi bi-arrow-right"></i>
              </button>
            </form>
            <p class="mt-3 mb-0 text-secondary small">
              Ainda não tem uma conta?
              <a href="cadastro.php" class="link-warning text-decoration-none">Cadastre-se</a>
            </p>
          </section>
          <aside class="col-md-5 d-none d-md-flex align-items-center p-4 p-lg-5 position-relative overflow-hidden text-white">
            <img src="public/banners/auth.jpg" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
            <div class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50"></div>
            <div class="position-relative z-2">
              <p class="fw-semibold small text-uppercase mb-2 text-warning">Gycanic</p>
              <h2 class="h3 fw-bold">Uma oficina mais organizada começa aqui.</h2>
              <p class="mb-0">
                Ferramentas simples para manter sua equipe, seus serviços e sua
                rotina sob controle.
              </p>
            </div>
          </aside>
        </div>
      </div>
<?php require __DIR__ . "/includes/rodape.php"; ?>
