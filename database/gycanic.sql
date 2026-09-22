/*M!999999\- enable the sandbox mode */ 
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblOficinas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `cep` varchar(9) NOT NULL,
  `documento` varchar(18) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_tblOficinas_usuario` (`usuario_id`),
  CONSTRAINT `fk_tblOficinas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `tblUsuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblProblemas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `servico_id` int(11) NOT NULL,
  `titulo` varchar(160) NOT NULL,
  `descricao` text DEFAULT NULL,
  `status` enum('em_analise','aguardando','resolvido') DEFAULT 'em_analise',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_tblProblemas_servico` (`servico_id`),
  CONSTRAINT `fk_tblProblemas_servico` FOREIGN KEY (`servico_id`) REFERENCES `tblServicos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblServicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(160) NOT NULL,
  `cliente` varchar(120) DEFAULT NULL,
  `cliente_telefone` varchar(20) DEFAULT NULL,
  `cliente_email` varchar(120) DEFAULT NULL,
  `veiculo` varchar(120) DEFAULT NULL,
  `placa` varchar(10) DEFAULT NULL,
  `ano` varchar(4) DEFAULT NULL,
  `cor` varchar(40) DEFAULT NULL,
  `servico` varchar(160) DEFAULT NULL,
  `funcionario_id` int(11) DEFAULT NULL,
  `status` enum('em_andamento','aguardando','concluido','cancelado') DEFAULT 'em_andamento',
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_tblServicos_usuario` (`usuario_id`),
  KEY `fk_tblServicos_funcionario` (`funcionario_id`),
  CONSTRAINT `fk_tblServicos_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `tblUsuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tblServicos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `tblUsuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tblUsuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo` enum('gerente','funcionario','usuario') DEFAULT 'funcionario',
  `foto` varchar(255) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `documento` varchar(18) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `funcao` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `uf` varchar(2) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `email_verificado` tinyint(1) NOT NULL DEFAULT 0,
  `codigo_verificacao` varchar(64) DEFAULT NULL,
  `codigo_expira_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
