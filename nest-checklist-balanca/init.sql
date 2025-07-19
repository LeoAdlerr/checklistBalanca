-- =============================================================================
-- NOTA TÉCNICA: Criação explícita de usuário com privilégios elevados.
--
-- Em vez de usar as variáveis de ambiente do Docker, criamos o usuário
-- e concedemos os privilégios aqui para garantir que ele tenha permissões
-- suficientes para operações futuras, como a criação de TRIGGERS.
-- =============================================================================
CREATE USER IF NOT EXISTS 'uaga_user'@'%' IDENTIFIED BY 'uaga_password';
GRANT ALL PRIVILEGES ON `uagabd`.* TO 'uaga_user'@'%';
FLUSH PRIVILEGES;

-- =============================================================================
-- DDL (Data Definition Language)
-- =============================================================================

-- Tabelas de Lookup (com IDs estáticos e predefinidos)
CREATE TABLE `uagabd`.`lookup_statuses` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Status possíveis para uma inspeção geral.';

CREATE TABLE `uagabd`.`lookup_modalities` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Modalidades de transporte disponíveis.';

CREATE TABLE `uagabd`.`lookup_operation_types` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Tipos de operação aduaneira.';

CREATE TABLE `uagabd`.`lookup_unit_types` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Tipos de unidade de carga.';

CREATE TABLE `uagabd`.`lookup_container_types` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Tipos específicos de contêineres.';

CREATE TABLE `uagabd`.`lookup_checklist_item_statuses` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Status para cada item individual da inspeção.';

CREATE TABLE `uagabd`.`lookup_seal_verification_statuses` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) COMMENT 'Status para a verificação de lacres na saída.';


-- Tabela mestre com a definição dos 18 pontos de inspeção.
CREATE TABLE `uagabd`.`master_inspection_points` (
  `id` INT PRIMARY KEY,
  `point_number` INT NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50) NOT NULL COMMENT 'Valores: ''VEICULO'', ''CONTEINER'''
) COMMENT 'Tabela mestre com os 18 pontos de inspeção padrão.';


-- Tabela central que representa uma inspeção (um checklist).
CREATE TABLE `uagabd`.`inspections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspector_name` VARCHAR(255) NOT NULL COMMENT 'Campo de texto livre para o MVP, substituindo a FK para users.',
  `status_id` INT NOT NULL,
  `entry_registration` VARCHAR(100) NULL,
  `vehicle_plates` VARCHAR(20) NULL,
  `transport_document` VARCHAR(100) NULL COMMENT 'Número do documento de transporte (ex: CTe, AWB).',
  `modality_id` INT NOT NULL,
  `operation_type_id` INT NOT NULL,
  `unit_type_id` INT NOT NULL,
  `container_type_id` INT NULL,

  `verified_length` DECIMAL(10, 2) NULL COMMENT 'Comprimento em metros, verificado na inspeção.',
  `verified_width` DECIMAL(10, 2) NULL COMMENT 'Largura em metros, verificada na inspeção.',
  `verified_height` DECIMAL(10, 2) NULL COMMENT 'Altura em metros, verificada na inspeção.',
  
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NULL,
  `driver_name` VARCHAR(255) NOT NULL,
  `driver_signature_path` VARCHAR(512) NULL,
  `inspector_signature_path` VARCHAR(512) NULL,
  `seal_uaga_post_inspection` VARCHAR(100) NULL,
  `seal_uaga_post_loading` VARCHAR(100) NULL,
  `seal_shipper` VARCHAR(100) NULL,
  `seal_rfb` VARCHAR(100) NULL,
  `seal_verification_rfb_status_id` INT NULL,
  `seal_verification_shipper_status_id` INT NULL,
  `seal_verification_tape_status_id` INT NULL,
  `seal_verification_responsible_name` VARCHAR(255) NULL,
  `seal_verification_signature_path` VARCHAR(512) NULL,
  `seal_verification_date` DATE NULL,
  `observations` TEXT NULL,
  `action_taken` TEXT NULL COMMENT 'Campo para as Providências Tomadas.',
  `generated_pdf_path` VARCHAR(512) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`status_id`) REFERENCES `uagabd`.`lookup_statuses`(`id`),
  FOREIGN KEY (`modality_id`) REFERENCES `uagabd`.`lookup_modalities`(`id`),
  FOREIGN KEY (`operation_type_id`) REFERENCES `uagabd`.`lookup_operation_types`(`id`),
  FOREIGN KEY (`unit_type_id`) REFERENCES `uagabd`.`lookup_unit_types`(`id`),
  FOREIGN KEY (`container_type_id`) REFERENCES `uagabd`.`lookup_container_types`(`id`),
  FOREIGN KEY (`seal_verification_rfb_status_id`) REFERENCES `uagabd`.`lookup_seal_verification_statuses`(`id`),
  FOREIGN KEY (`seal_verification_shipper_status_id`) REFERENCES `uagabd`.`lookup_seal_verification_statuses`(`id`),
  FOREIGN KEY (`seal_verification_tape_status_id`) REFERENCES `uagabd`.`lookup_seal_verification_statuses`(`id`),

  INDEX `idx_inspections_driver_name` (`driver_name`),
  INDEX `idx_inspections_vehicle_plates` (`vehicle_plates`)
) COMMENT 'Armazena cada checklist de inspeção realizado.';


-- Tabela que liga uma inspeção aos seus 18 pontos.
CREATE TABLE `uagabd`.`inspection_checklist_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspection_id` INT NOT NULL,
  `master_point_id` INT NOT NULL,
  `status_id` INT NOT NULL,
  `observations` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE `unique_inspection_point` (`inspection_id`, `master_point_id`),
  FOREIGN KEY (`inspection_id`) REFERENCES `uagabd`.`inspections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`master_point_id`) REFERENCES `uagabd`.`master_inspection_points`(`id`),
  FOREIGN KEY (`status_id`) REFERENCES `uagabd`.`lookup_checklist_item_statuses`(`id`)
) COMMENT 'Registros de cada um dos 18 pontos para uma inspeção.';


-- Tabela para armazenar as evidências (imagens) de cada item do checklist.
CREATE TABLE `uagabd`.`item_evidences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `file_path` VARCHAR(512) NOT NULL COMMENT 'Caminho do arquivo no sistema de storage',
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT NOT NULL COMMENT 'Tamanho em bytes',
  `mime_type` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`item_id`) REFERENCES `uagabd`.`inspection_checklist_items`(`id`) ON DELETE CASCADE
) COMMENT 'Evidências (imagens) associadas a um item do checklist.';


-- =============================================================================
-- DML (Data Manipulation Language)
-- =============================================================================

-- Populando as tabelas de lookup com IDs estáticos
INSERT INTO `uagabd`.`lookup_statuses` (`id`, `name`) VALUES (1, 'EM_INSPECAO'), (2, 'APROVADO'), (3, 'REPROVADO');
INSERT INTO `uagabd`.`lookup_modalities` (`id`, `name`) VALUES (1, 'RODOVIARIO'), (2, 'MARITIMO'), (3, 'AEREO');
INSERT INTO `uagabd`.`lookup_operation_types` (`id`, `name`) VALUES (1, 'VERDE'), (2, 'LARANJA'), (3, 'VERMELHA');
INSERT INTO `uagabd`.`lookup_unit_types` (`id`, `name`) VALUES (1, 'CONTAINER'), (2, 'BAU');
INSERT INTO `uagabd`.`lookup_container_types` (`id`, `name`) VALUES (1, 'DRY_20'), (2, 'DRY_40'), (3, 'DRY_HC_40'), (4, 'REEFER_40');
INSERT INTO `uagabd`.`lookup_checklist_item_statuses` (`id`, `name`) VALUES (1, 'EM_INSPECAO'), (2, 'CONFORME'), (3, 'NAO_CONFORME'), (4, 'N_A');
INSERT INTO `uagabd`.`lookup_seal_verification_statuses` (`id`, `name`) VALUES (1, 'OK'), (2, 'NAO_OK'), (3, 'N_A');

-- Populando a tabela mestre com os 18 pontos de inspeção
INSERT INTO `uagabd`.`master_inspection_points` (`id`, `point_number`, `name`, `description`, `category`) VALUES
(1, 1, 'SEÇÃO INFERIOR', 'Verificar com auxílio de espelho e lanterna os espaços entre as vigas estruturais.', 'CONTEINER'),
(2, 2, 'PORTA (Interior e Exterior)', 'Verificar mecanismos de travamento & parafusos. Martelar levemente buscando som "oco".', 'CONTEINER'),
(3, 3, 'LATERAL DIREITA', 'Verificar reparos incomuns nas vigas estruturais. Martelar levemente buscando som "oco".', 'CONTEINER'),
(4, 4, 'LATERAL ESQUERDA', 'Verificar reparos incomuns nas vigas estruturais. Martelar levemente buscando som "oco".', 'CONTEINER'),
(5, 5, 'PAREDE FRONTAL', 'Verificar se possui sistema de refrigeração. Martelar levemente buscando som "oco".', 'CONTEINER'),
(6, 6, 'TETO', 'Verificar se a altura é uniforme em todo contêiner. Martelar levemente buscando som "oco".', 'CONTEINER'),
(7, 7, 'PISO/ASSOALHO (Interior)', 'Verificar se o piso está nivelado e se há reparos ou painéis novos.', 'CONTEINER'),
(8, 8, 'IDENTIFICAÇÃO DE PRAGAS VISÍVEIS', 'Verificar a unidade de carga em busca de pragas visíveis.', 'CONTEINER'),
(9, 9, 'PARA-CHOQUES', 'Verificar com espelho e lanterna materiais ou compartimentos escondidos.', 'VEICULO'),
(10, 10, 'MOTOR', 'Verificar com espelhos e lanternas a área do motor, tampas e filtros.', 'VEICULO'),
(11, 11, 'PNEUS', 'Martelar levemente em todo pneu, incluindo steps, buscando som "oco".', 'VEICULO'),
(12, 12, 'PISO DO CAMINHÃO', 'Levantar o carpete para confirmar se existem novos reparos ou compartimentos.', 'VEICULO'),
(13, 13, 'TANQUE DE COMBUSTÍVEL', 'Martelar levemente para verificar se não há sólidos dentro do tanque.', 'VEICULO'),
(14, 14, 'CABINE', 'Verificar dentro e fora de compartimentos por qualquer conteúdo ilegal.', 'VEICULO'),
(15, 15, 'TANQUE DE AR', 'Martelar levemente em todo tanque de ar e verificar sinais de adulteração.', 'VEICULO'),
(16, 16, 'EIXO DE TRANSMISSÃO', 'Verificar sinais de reparos ou pinturas novas e martelar levemente.', 'VEICULO'),
(17, 17, 'ÁREA DA 5ª RODA', 'Verificar espaços livres e área da bateria por conteúdo ilegal.', 'VEICULO'),
(18, 18, 'SISTEMA DE EXAUSTÃO', 'Verificar se não existem cordas ou itens amarrados e se o escapamento não está solto.', 'VEICULO');