CREATE DATABASE IF NOT EXISTS `uagabd`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- =============================================================================
-- NOTA TÉCNICA: Criação explícita de usuário com privilégios elevados.
-- =============================================================================
CREATE USER IF NOT EXISTS 'uaga_user'@'%' IDENTIFIED BY 'uaga_password';
GRANT ALL PRIVILEGES ON `uagabd`.* TO 'uaga_user'@'%';
FLUSH PRIVILEGES;

-- Garante que o banco de dados também tenha o charset correto.
ALTER DATABASE `uagabd` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `uagabd`;

-- =============================================================================
-- DDL (Data Definition Language)
-- =============================================================================
CREATE TABLE `lookup_statuses` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lookup_modalities` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lookup_operation_types` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lookup_unit_types` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lookup_container_types` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lookup_checklist_item_statuses` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lookup_seal_verification_statuses` (
`id` INT PRIMARY KEY,
`name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `master_inspection_points` (
  `id` INT PRIMARY KEY,
  `point_number` INT NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50) NOT NULL
) ENGINE=InnoDB;


CREATE TABLE `inspections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspector_name` VARCHAR(255) NOT NULL,
  `status_id` INT NOT NULL,
  `entry_registration` VARCHAR(100) NULL,
  `vehicle_plates` VARCHAR(20) NULL,
  `transport_document` VARCHAR(100) NULL,
  `modality_id` INT NOT NULL,
  `operation_type_id` INT NOT NULL,
  `unit_type_id` INT NOT NULL,
  `container_type_id` INT NULL,
  `verified_length` DECIMAL(10, 2) NULL,
  `verified_width` DECIMAL(10, 2) NULL,
  `verified_height` DECIMAL(10, 2) NULL,
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
  `action_taken` TEXT NULL,
  `generated_pdf_path` VARCHAR(512) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (`status_id`) REFERENCES `lookup_statuses`(`id`),
  FOREIGN KEY (`modality_id`) REFERENCES `lookup_modalities`(`id`),
  FOREIGN KEY (`operation_type_id`) REFERENCES `lookup_operation_types`(`id`),
  FOREIGN KEY (`unit_type_id`) REFERENCES `lookup_unit_types`(`id`),
  FOREIGN KEY (`container_type_id`) REFERENCES `lookup_container_types`(`id`),
  FOREIGN KEY (`seal_verification_rfb_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),
  FOREIGN KEY (`seal_verification_shipper_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),
  FOREIGN KEY (`seal_verification_tape_status_id`) REFERENCES `lookup_seal_verification_statuses`(`id`),

  -- Índices para campos de pesquisa comum que você já tinha (excelente!)
  INDEX `idx_inspections_driver_name` (`driver_name`),
  INDEX `idx_inspections_vehicle_plates` (`vehicle_plates`),
  
  -- Índices para todas as chaves estrangeiras para otimizar JOINs e DELETEs
  INDEX `idx_status_id` (`status_id`),
  INDEX `idx_modality_id` (`modality_id`),
  INDEX `idx_operation_type_id` (`operation_type_id`),
  INDEX `idx_unit_type_id` (`unit_type_id`),
  INDEX `idx_container_type_id` (`container_type_id`),
  INDEX `idx_seal_rfb_status_id` (`seal_verification_rfb_status_id`),
  INDEX `idx_seal_shipper_status_id` (`seal_verification_shipper_status_id`),
  INDEX `idx_seal_tape_status_id` (`seal_verification_tape_status_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inspection_checklist_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `inspection_id` INT NOT NULL,
  `master_point_id` INT NOT NULL,
  `status_id` INT NOT NULL,
  `observations` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE `unique_inspection_point` (`inspection_id`, `master_point_id`),
  
  -- Foreign Keys
  FOREIGN KEY (`inspection_id`) REFERENCES `inspections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`master_point_id`) REFERENCES `master_inspection_points`(`id`),
  FOREIGN KEY (`status_id`) REFERENCES `lookup_checklist_item_statuses`(`id`),
  
  -- Índice principal para buscar todos os itens de uma inspeção
  INDEX `idx_inspection_id` (`inspection_id`),
  -- Índices secundários para relatórios e análises
  INDEX `idx_master_point_id` (`master_point_id`),
  INDEX `idx_status_id_item` (`status_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_evidences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (`item_id`) REFERENCES `inspection_checklist_items`(`id`) ON DELETE CASCADE,

  -- Índice principal para buscar todas as evidências de um item
  INDEX `idx_item_id` (`item_id`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- =============================================================================
-- DML (Data Manipulation Language) - COM DADOS ATUALIZADOS
-- =============================================================================

-- Populando as tabelas de lookup com IDs estáticos
INSERT INTO `uagabd`.`lookup_statuses` (`id`, `name`) VALUES (1, 'EM_INSPECAO'), (2, 'APROVADO'), (3, 'REPROVADO');
INSERT INTO `uagabd`.`lookup_modalities` (`id`, `name`) VALUES (1, 'RODOVIARIO'), (2, 'MARITIMO'), (3, 'AEREO');
INSERT INTO `uagabd`.`lookup_operation_types` (`id`, `name`) VALUES (1, 'VERDE'), (2, 'LARANJA'), (3, 'VERMELHA');
INSERT INTO `uagabd`.`lookup_unit_types` (`id`, `name`) VALUES (1, 'CONTAINER'), (2, 'BAU');
INSERT INTO `uagabd`.`lookup_container_types` (`id`, `name`) VALUES (1, 'DRY_20'), (2, 'DRY_40'), (3, 'DRY_HC_40'), (4, 'REEFER_40');
INSERT INTO `uagabd`.`lookup_checklist_item_statuses` (`id`, `name`) VALUES (1, 'EM_INSPECAO'), (2, 'CONFORME'), (3, 'NAO_CONFORME'), (4, 'N_A');
INSERT INTO `uagabd`.`lookup_seal_verification_statuses` (`id`, `name`) VALUES (1, 'OK'), (2, 'NAO_OK'), (3, 'N_A');

-- Populando a tabela mestre com os 18 pontos de inspeção (sem acentos)
INSERT INTO `uagabd`.`master_inspection_points` (`id`, `point_number`, `name`, `description`, `category`) VALUES
(1, 1, 'SECAO INFERIOR', 'Verificar com auxilio de espelho e lanterna os espacos entre as vigas estruturais.', 'CONTEINER'),
(2, 2, 'PORTA (Interior e Exterior)', 'Verificar mecanismos de travamento & parafusos. Martelar levemente buscando som "oco".', 'CONTEINER'),
(3, 3, 'LATERAL DIREITA', 'Verificar reparos incomuns nas vigas estruturais. Martelar levemente buscando som "oco".', 'CONTEINER'),
(4, 4, 'LATERAL ESQUERDA', 'Verificar reparos incomuns nas vigas estruturais. Martelar levemente buscando som "oco".', 'CONTEINER'),
(5, 5, 'PAREDE FRONTAL', 'Verificar se possui sistema de refrigeracao. Martelar levemente buscando som "oco".', 'CONTEINER'),
(6, 6, 'TETO', 'Verificar se a altura e uniforme em todo conteiner. Martelar levemente buscando som "oco".', 'CONTEINER'),
(7, 7, 'PISO/ASSOALHO (Interior)', 'Verificar se o piso esta nivelado e se ha reparos ou paineis novos.', 'CONTEINER'),
(8, 8, 'IDENTIFICACAO DE PRAGAS VISIVEIS', 'Verificar a unidade de carga em busca de pragas visiveis.', 'CONTEINER'),
(9, 9, 'PARA-CHOQUES', 'Verificar com espelho e lanterna materiais ou compartimentos escondidos.', 'VEICULO'),
(10, 10, 'MOTOR', 'Verificar com espelhos e lanternas a area do motor, tampas e filtros.', 'VEICULO'),
(11, 11, 'PNEUS', 'Martelar levemente em todo pneu, incluindo steps, buscando som "oco".', 'VEICULO'),
(12, 12, 'PISO DO CAMINHAO', 'Levantar o carpete para confirmar se existem novos reparos ou compartimentos.', 'VEICULO'),
(13, 13, 'TANQUE DE COMBUSTIVEL', 'Martelar levemente para verificar se nao ha solidos dentro do tanque.', 'VEICULO'),
(14, 14, 'CABINE', 'Verificar dentro e fora de compartimentos por qualquer conteudo ilegal.', 'VEICULO'),
(15, 15, 'TANQUE DE AR', 'Martelar levemente em todo tanque de ar e verificar sinais de adulteracao.', 'VEICULO'),
(16, 16, 'EIXO DE TRANSMISSAO', 'Verificar sinais de reparos ou pinturas novas e martelar levemente.', 'VEICULO'),
(17, 17, 'AREA DA 5 RODA', 'Verificar espacos livres e area da bateria por conteudo ilegal.', 'VEICULO'),
(18, 18, 'SISTEMA DE EXAUSTAO', 'Verificar se nao existem cordas ou itens amarrados e se o escapamento nao esta solto.', 'VEICULO');