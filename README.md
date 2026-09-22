# Gycanic — Gestão inteligente de oficinas mecânicas

Sistema web (projeto acadêmico) para oficinas mecânicas: cadastro de usuários,
gestão de funcionários e oficinas, abertura de ordens de serviço (OS) e
acompanhamento dos problemas identificados em cada veículo.

## Tecnologias

- **Front-end:** HTML5, Bootstrap 5.3 (CDN), Bootstrap Icons e JavaScript puro (sem jQuery)
- **Back-end:** PHP 8+ com PDO e sessões
- **Banco de dados:** MySQL/MariaDB — script em `database/gycanic.sql`
- **Integrações:** API FIPE v2 (proxy com cache local em `includes/api/fipe_cache/`) e
  API de imagens (Wikimedia Commons)

## Estrutura do projeto

| Caminho | Descrição |
| --- | --- |
| `*.php` | Páginas do sistema (`index`, `login`, `cadastro`, `perfil`, `funcionarios`, `oficinas`, `oficina-detalhe`, `servicos`, `servicos-lista`, `adicionar-*`, `editar-funcionario`) |
| `includes/` | Layout compartilhado: `topo.php` (cabeçalho + menu), `sidebar.php`, `rodape.php` e `auth.php` (sessão) |
| `css/style.css` | Tema escuro/laranja (antes repetido dentro de cada página) |
| `js/main.js` | Todo o JavaScript do site (antes repetido dentro de cada página) |
| `api.php` | Único ponto de entrada do back-end (`api.php?acao=<nome>`) |
| `includes/api/` | Endpoints do back-end: sessão, CRUD de usuários/oficinas/serviços, uploads e integração FIPE |
| `includes/api/fipe_cache/` | Cache em JSON das respostas da API FIPE |
| `database/gycanic.sql` | Criação das tabelas (`tblUsuarios`, `tblOficinas`, `tblServicos`, `tblProblemas`) |
| `uploads/` | Fotos de perfil enviadas pelos usuários |
| `public/banners/` | Imagens usadas nas telas |
| `larpagem/` | Mini-jogo (projeto paralelo) hospedado na mesma pasta |

## Como rodar localmente (XAMPP / LAMP)

1. Copie o projeto para a pasta pública do servidor (ex.: `htdocs/gycanic`).
2. Importe o banco de dados:
   ```bash
   mysql -u root -p < database/gycanic.sql
   ```
3. Crie o arquivo de credenciais a partir do modelo:
   ```bash
   cp includes/api/config.example.php includes/api/config.php
   ```
   Por padrão o bloco `local` aponta para `127.0.0.1`, banco `gycanic`,
   usuário `root` e senha vazia (padrão do XAMPP).
4. Acesse `http://localhost/gycanic/index.php`.

## Como criar uma nova página

O cabeçalho, o menu lateral e os scripts ficam em `includes/` — a página só
contém o próprio conteúdo:

```php
<?php
$titulo = 'Serviços';   // título da aba
$ativo  = 'servicos';   // item do menu a destacar ('' = nenhum)
require __DIR__ . '/includes/topo.php';
?>
  <section class="container-xl py-4">
    <h1 class="h3">Serviços</h1>
    <!-- ...conteúdo Bootstrap... -->
  </section>
<?php require __DIR__ . '/includes/rodape.php'; ?>
```

Variáveis opcionais: `$protegida = false;` em páginas públicas (login, cadastro,
início) e `$menu = false;` em páginas sem menu lateral.

Páginas internas exigem sessão: quem não está logado é redirecionado para
`login.php` pelo `includes/auth.php` (a checagem é feita no servidor, não só
pelo JavaScript).

### Variáveis de ambiente (opcional)

Crie um arquivo `.env` na raiz do projeto com:

```env
FIPE_API_URL=https://fipe.parallelum.com.br/api/v2
FIPE_API_TOKEN=
IMAGE_API_URL=https://commons.wikimedia.org/w/api.php
IMAGE_API_KEY=
```

O `FIPE_API_TOKEN` é opcional (a API funciona sem token, com limite menor de
requisições).

## Requisitos

- PHP 8.0 ou superior com as extensões `pdo_mysql`, `curl` e `session`
- MySQL 5.7+ / MariaDB 10.4+ (tabelas InnoDB)
- Apache com `AllowOverride All` habilitado (para os arquivos `.htaccess`)

## Segurança

- `includes/api/config.php` e `.env` **não são versionados** (contêm credenciais
  e estão no `.gitignore`). Use `includes/api/config.example.php` como modelo.
- `includes/.htaccess` bloqueia o acesso direto a todos os arquivos de
  `includes/` — o back-end só é acessível por `api.php?acao=...`, e o
  `uploads/.htaccess` impede a execução de scripts enviados pelos usuários.
- Em produção, prefira as variáveis de ambiente `GYCANIC_DB_HOST`,
  `GYCANIC_DB_NAME`, `GYCANIC_DB_USER` e `GYCANIC_DB_PASS`, que têm prioridade
  sobre os valores do arquivo de configuração.
