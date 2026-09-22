<?php
/**
 * Modelo de configuração do banco por ambiente.
 *
 * COMO USAR:
 *   1. Copie este arquivo para "includes/api/config.php":
 *        cp includes/api/config.example.php includes/api/config.php
 *   2. Preencha o bloco 'production' (e o 'local', se necessário).
 *
 * O arquivo "includes/api/config.php" contém credenciais reais e por isso está
 * no .gitignore — ele nunca é enviado para o repositório.
 *
 * O arquivo db.php escolhe automaticamente entre local e produção:
 *   - localhost / 127.0.0.1 / ::1  -> bloco 'local'
 *   - qualquer outro domínio       -> bloco 'production'
 * Variáveis de ambiente (GYCANIC_DB_HOST, GYCANIC_DB_NAME, GYCANIC_DB_USER,
 * GYCANIC_DB_PASS) têm prioridade sobre os valores abaixo.
 */
return [
    'local' => [
        'host' => '127.0.0.1',
        'dbname' => 'gycanic',
        'user' => 'root',
        'pass' => '',
    ],
    'production' => [
        'host' => 'SEU_HOST_MYSQL',
        'dbname' => 'SEU_BANCO_DE_DADOS',
        'user' => 'SEU_USUARIO',
        'pass' => 'SUA_SENHA',
    ],
];
