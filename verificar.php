<?php
/** Página: Verificar e-mail. */
$titulo = 'Verificar e-mail';
$ativo  = '';
$protegida = false;
$menu = false;
require __DIR__ . '/includes/topo.php';

$email = trim((string) ($_GET['email'] ?? ''));
$emailValido = filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
$aviso = isset($_GET['enviado'])
    ? 'Enviamos um código de 6 dígitos para o seu e-mail.'
    : (isset($_GET['reenviado']) ? 'Enviamos um novo código para o seu e-mail.' : '');
?>
      <div class="container">
        <div class="row g-0 justify-content-center rounded-4 overflow-hidden shadow border border-secondary">
          <section class="col-md-7 col-lg-6 p-4 p-lg-5 bg-dark">
            <a href="index.php" class="fs-3 fw-bolder text-decoration-none text-white">
              <span class="text-warning">Gy</span>canic</a>
            <p class="text-warning text-uppercase fw-semibold small mt-4 mb-1">Confirme seu e-mail</p>
            <h1 class="h3 fw-bold">Digite o código que enviamos</h1>
            <p class="text-secondary mb-2">
              Escreva o código de 6 dígitos enviado para
              <strong class="text-body"><?= $emailValido ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8') : 'o seu e-mail' ?></strong>.
              Ele vale por 15 minutos.
            </p>

            <?php if ($aviso !== ''): ?>
              <div class="alert alert-success py-2" role="status">
                <i class="bi bi-envelope-check-fill me-1"></i><?= $aviso ?>
              </div>
            <?php endif; ?>

            <form action="api.php?acao=verificar-email" method="post" class="mt-3">
              <input type="hidden" name="email" value="<?= $emailValido ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8') : '' ?>" />
              <div class="mb-3">
                <label for="codigo" class="form-label">Código de verificação</label>
                <input
                  class="form-control form-control-lg text-center"
                  type="text"
                  inputmode="numeric"
                  pattern="\d{6}"
                  maxlength="6"
                  minlength="6"
                  id="codigo"
                  name="codigo"
                  placeholder="000000"
                  autocomplete="one-time-code"
                  required
                  autofocus
                />
              </div>
              <button class="btn btn-warning fw-semibold w-100" type="submit">
                Confirmar e-mail <i class="bi bi-arrow-right"></i>
              </button>
            </form>

            <form action="api.php?acao=reenviar-codigo" method="post" class="mt-2">
              <input type="hidden" name="email" value="<?= $emailValido ? htmlspecialchars($email, ENT_QUOTES, 'UTF-8') : '' ?>" />
              <button class="btn btn-link btn-sm text-warning text-decoration-none" type="submit">
                Não recebeu? Reenviar código
              </button>
            </form>

            <p class="mt-2 mb-0 text-secondary small">
              <a href="login.php" class="link-warning text-decoration-none">Voltar para o login</a>
            </p>
          </section>
          <aside class="col-md-5 d-none d-md-flex align-items-center p-4 p-lg-5 position-relative overflow-hidden text-white">
            <img src="public/banners/auth.jpg" alt="" class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
            <div class="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-50"></div>
            <div class="position-relative z-2">
              <p class="fw-semibold small text-uppercase mb-2 text-warning">Último passo</p>
              <h2 class="h3 fw-bold">Sua conta está quase pronta.</h2>
              <p class="mb-0">
                A confirmação garante que ninguém use o seu e-mail sem
                autorização.
              </p>
            </div>
          </aside>
        </div>
      </div>
<?php require __DIR__ . "/includes/rodape.php"; ?>
