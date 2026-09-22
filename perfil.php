<?php
/** Página: Perfil. */
$titulo = 'Perfil';
$ativo  = 'perfil';
require __DIR__ . '/includes/topo.php';
?>
      <section class="container-xl py-4">
        <header class="mb-4">
          <p class="text-warning text-uppercase fw-semibold small mb-1">Sua conta</p>
          <h1 class="h2 fw-bold mb-1">Perfil</h1>
          <p class="text-secondary mb-0">
            Mantenha suas informações pessoais atualizadas.
          </p>
        </header>
        <div class="card bg-dark border-secondary rounded-4 mb-4">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="position-relative">
                <img
                  id="profile-avatar-img"
                  alt="Foto de perfil"
                  class="rounded-circle object-fit-cover"
                  width="96"
                  height="96"
                  hidden
                />
                <span
                  id="profile-avatar-initial"
                  class="d-inline-flex align-items-center justify-content-center rounded-circle text-bg-secondary fw-bold p-4 fs-2"
                >?</span>
              </div>
              <div>
                <h2 class="h4 fw-bold mb-1" id="profile-title">Meu perfil</h2>
                <p class="text-secondary small mb-2">Gerencie sua foto e suas informações pessoais.</p>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-warning"
                  id="profile-avatar-edit"
                  aria-label="Editar foto"
                  title="Editar foto"
                >
                  <i class="bi bi-camera"></i> Trocar foto
                </button>
              </div>
            </div>
            <form id="profile-form">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="nome" class="form-label">Nome</label>
                    <input id="nome" name="nome" class="form-control" placeholder="Seu nome" autocomplete="name" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input
                      id="email"
                      name="email"
                      class="form-control"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      readonly
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label for="foto" class="form-label">Foto de perfil</label>
                <input id="foto" name="foto" type="file" accept="image/*" class="form-control" />
                <span class="text-secondary small">
                  Toque na câmera para escolher uma foto. JPG, PNG, GIF, WEBP — máx. 2 MB.
                </span>
              </div>
              <div id="profile-alert" role="alert"></div>
              <button class="btn btn-warning fw-semibold" type="submit">
                Salvar alterações
              </button>
            </form>
          </div>
        </div>
        <div class="card bg-dark border-secondary rounded-4 mb-4">
          <div class="card-body p-4">
            <h2 class="h5 fw-bold mb-4">
              <i class="bi bi-person-vcard text-warning"></i> Dados da conta
            </h2>
            <div class="row g-3">
              <div class="col-md-4">
                <span class="text-secondary small text-uppercase d-block">Cargo</span>
                <span class="fw-semibold" id="profile-cargo">—</span>
              </div>
              <div class="col-md-4">
                <span class="text-secondary small text-uppercase d-block">E-mail</span>
                <span class="fw-semibold" id="profile-email-info">—</span>
              </div>
              <div class="col-md-4">
                <span class="text-secondary small text-uppercase d-block">Membro desde</span>
                <span class="fw-semibold" id="profile-membro">—</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-dark border-secondary rounded-4">
          <div class="card-body p-4">
            <h2 class="h5 fw-bold mb-1">
              <i class="bi bi-lock text-warning"></i> Segurança
            </h2>
            <p class="text-secondary small">
              Altere sua senha periodicamente para manter sua conta segura.
            </p>
            <form id="senha-form">
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="senha-atual" class="form-label">Senha atual</label>
                    <input
                      class="form-control"
                      type="password"
                      id="senha-atual"
                      name="senha_atual"
                      autocomplete="current-password"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="nova-senha" class="form-label">Nova senha</label>
                    <input
                      class="form-control"
                      type="password"
                      id="nova-senha"
                      name="nova_senha"
                      minlength="6"
                      autocomplete="new-password"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label for="confirmar-senha" class="form-label">Confirmar nova senha</label>
                    <input
                      class="form-control"
                      type="password"
                      id="confirmar-senha"
                      name="confirmar_senha"
                      minlength="6"
                      autocomplete="new-password"
                      required
                    />
                  </div>
                </div>
              </div>
              <div id="senha-alert" role="alert"></div>
              <button class="btn btn-warning fw-semibold" type="submit">
                <i class="bi bi-key"></i> Atualizar senha
              </button>
            </form>
          </div>
        </div>
      </section>
<?php require __DIR__ . "/includes/rodape.php"; ?>
