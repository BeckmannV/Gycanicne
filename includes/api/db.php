<?php
/**
 * Cria a conexão PDO usada pelos arquivos PHP.
 *
 * Em localhost usa o MySQL padrão do XAMPP. Em um domínio, usa a configuração
 * de produção. Variáveis de ambiente, quando existirem, sempre têm prioridade.
 */
$config = require __DIR__ . '/config.php';
$hostName = strtolower((string) ($_SERVER['HTTP_HOST'] ?? 'localhost'));
$hostName = explode(':', $hostName)[0];
$isLocal = in_array($hostName, ['localhost', '127.0.0.1', '::1'], true);
$environment = $isLocal ? 'local' : 'production';
$settings = $config[$environment];

$host = getenv('GYCANIC_DB_HOST') ?: $settings['host'];
$dbname = getenv('GYCANIC_DB_NAME') ?: $settings['dbname'];
$user = getenv('GYCANIC_DB_USER') ?: $settings['user'];
$pass = getenv('GYCANIC_DB_PASS') ?: $settings['pass'];

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    exit('Não foi possível conectar ao banco de dados. Verifique as credenciais em includes/api/config.php.');
}

// Garante as tabelas da versão atual caso o banco hospedado ainda não as possua.
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS tblUsuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        cargo ENUM('gerente', 'funcionario', 'usuario') DEFAULT 'funcionario',
        foto VARCHAR(255) DEFAULT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

// Garante a coluna de foto em instalações mais antigas.
try {
    $pdo->exec('ALTER TABLE tblUsuarios ADD COLUMN foto VARCHAR(255) DEFAULT NULL');
} catch (PDOException $e) {
    // Coluna já existente é ignorado.
}

// Garante o ENUM de cargo com o papel 'usuario' em instalações antigas.
try {
    $pdo->exec("ALTER TABLE tblUsuarios MODIFY cargo ENUM('gerente', 'funcionario', 'usuario') DEFAULT 'funcionario'");
} catch (PDOException $e) {
    // Já está no formato desejado é ignorado.
}

// Colunas do cadastro profissional de funcionários.
foreach ([
    'documento VARCHAR(18) DEFAULT NULL',
    'telefone VARCHAR(20) DEFAULT NULL',
    'data_nascimento DATE DEFAULT NULL',
    'funcao VARCHAR(100) DEFAULT NULL',
    'endereco VARCHAR(255) DEFAULT NULL',
    'cidade VARCHAR(100) DEFAULT NULL',
    'uf VARCHAR(2) DEFAULT NULL',
    'cep VARCHAR(9) DEFAULT NULL',
] as $coluna) {
    $nome = trim(explode(' ', $coluna)[0]);
    try {
        $pdo->exec("ALTER TABLE tblUsuarios ADD COLUMN $coluna");
    } catch (PDOException $e) {
        // Coluna já existente é ignorado.
    }
}

$pdo->exec(
    "CREATE TABLE IF NOT EXISTS tblOficinas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(120) NOT NULL,
        cep VARCHAR(9) NOT NULL,
        documento VARCHAR(18) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tblOficinas_usuario FOREIGN KEY (usuario_id) REFERENCES tblUsuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

// Ordens de serviço (OS) e problemas identificados em cada uma.
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS tblServicos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        titulo VARCHAR(160) NOT NULL,
        cliente VARCHAR(120) DEFAULT NULL,
        cliente_telefone VARCHAR(20) DEFAULT NULL,
        cliente_email VARCHAR(120) DEFAULT NULL,
        veiculo VARCHAR(120) DEFAULT NULL,
        placa VARCHAR(10) DEFAULT NULL,
        ano VARCHAR(4) DEFAULT NULL,
        cor VARCHAR(40) DEFAULT NULL,
        servico VARCHAR(160) DEFAULT NULL,
        funcionario_id INT DEFAULT NULL,
        status ENUM('em_andamento', 'aguardando', 'concluido', 'cancelado') DEFAULT 'em_andamento',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tblServicos_usuario FOREIGN KEY (usuario_id) REFERENCES tblUsuarios(id) ON DELETE CASCADE,
        CONSTRAINT fk_tblServicos_funcionario FOREIGN KEY (funcionario_id) REFERENCES tblUsuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);
$pdo->exec(
    "CREATE TABLE IF NOT EXISTS tblProblemas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        servico_id INT NOT NULL,
        titulo VARCHAR(160) NOT NULL,
        descricao TEXT,
        status ENUM('em_analise', 'aguardando', 'resolvido') DEFAULT 'em_analise',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tblProblemas_servico FOREIGN KEY (servico_id) REFERENCES tblServicos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
);

// --- Verificação de e-mail por código -------------------------------------
try {
    $pdo->exec("ALTER TABLE tblUsuarios ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0");
    // Contas criadas antes desta atualização já são consideradas confirmadas.
    $pdo->exec("UPDATE tblUsuarios SET email_verificado = 1");
} catch (PDOException $e) {
    // Coluna já existente é ignorada.
}
foreach (['codigo_verificacao VARCHAR(64) DEFAULT NULL', 'codigo_expira_em DATETIME DEFAULT NULL'] as $coluna) {
    try {
        $pdo->exec("ALTER TABLE tblUsuarios ADD COLUMN $coluna");
    } catch (PDOException $e) {
        // Coluna já existente é ignorada.
    }
}
