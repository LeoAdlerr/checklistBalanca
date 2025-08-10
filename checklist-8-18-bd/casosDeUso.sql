-- =============================================================================
-- Script de Validação de Casos de Uso
-- Dialeto: MySQL
-- Objetivo: Simular os fluxos de usuário da aplicação para validar se o
--           modelo de dados suporta todas as regras de negócio do MVP.
-- =============================================================================

-- =============================================================================
-- CENÁRIO 1: Inspeção que será APROVADA
-- =============================================================================

-- Fluxo 2: Realização de uma Nova Inspeção
-- -----------------------------------------------------------------------------
-- Passo 1: O inspetor inicia uma nova inspeção.
-- Ação: Um novo registro é criado na tabela `inspections` com status 'EM_INSPECAO'.
--       Automaticamente, os 18 itens de checklist são criados para esta inspeção.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Insere a inspeção principal
INSERT INTO `inspections` (
    `inspector_name`, `status_id`, `entry_registration`, `vehicle_plates`,
    `modality_id`, `operation_type_id`, `unit_type_id`, `container_type_id`,
    `start_datetime`, `driver_name`
) VALUES (
    'Leonardo Adler', 1, 'REG-2025-ABC', 'XYZ-1234',
    1, 1, 1, 2,
    NOW(), 'João Motorista'
);

-- Pega o ID da inspeção recém-criada
SET @inspection_id_aprovada = LAST_INSERT_ID();

-- Insere os 18 itens de checklist vinculados a esta inspeção
INSERT INTO `inspection_checklist_items` (`inspection_id`, `master_point_id`, `status_id`)
SELECT @inspection_id_aprovada, `id`, 1 FROM `master_inspection_points`;

COMMIT;

-- Verificação: Mostra a inspeção e seus itens recém-criados
SELECT id, inspector_name, status_id FROM `inspections` WHERE id = @inspection_id_aprovada;
SELECT master_point_id, status_id, observations FROM `inspection_checklist_items` WHERE inspection_id = @inspection_id_aprovada;


-- -----------------------------------------------------------------------------
-- Passo 2: O inspetor avalia alguns pontos do checklist.
-- Ação: Atualiza o status e as observações de itens específicos. Anexa evidências.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Atualiza o Ponto 11 (PNEUS) para 'CONFORME'
UPDATE `inspection_checklist_items`
SET `status_id` = 2, `observations` = 'Todos os pneus em bom estado.'
WHERE `inspection_id` = @inspection_id_aprovada AND `master_point_id` = 11;

-- Atualiza o Ponto 10 (MOTOR) para 'CONFORME' e anexa uma evidência
UPDATE `inspection_checklist_items`
SET `status_id` = 2, `observations` = 'Motor limpo, sem vazamentos aparentes.'
WHERE `inspection_id` = @inspection_id_aprovada AND `master_point_id` = 10;

SET @item_motor_id = (SELECT id FROM `inspection_checklist_items` WHERE `inspection_id` = @inspection_id_aprovada AND `master_point_id` = 10);
INSERT INTO `item_evidences` (`item_id`, `file_path`, `file_name`, `file_size`, `mime_type`)
VALUES (@item_motor_id, '/uploads/insp_1/10_timestamp.jpg', 'motor_ok.jpg', 1024, 'image/jpeg');

COMMIT;

-- Verificação: Mostra os itens atualizados e a nova evidência
SELECT master_point_id, status_id, observations FROM `inspection_checklist_items` WHERE inspection_id = @inspection_id_aprovada AND master_point_id IN (10, 11);
SELECT * FROM `item_evidences` WHERE item_id = @item_motor_id;


-- Fluxo 3: Finalização da Inspeção
-- -----------------------------------------------------------------------------
-- Passo 3: O inspetor avalia os 16 pontos restantes como 'CONFORME' ou 'N/A'.
-- -----------------------------------------------------------------------------
UPDATE `inspection_checklist_items`
SET `status_id` = 2 -- CONFORME
WHERE `inspection_id` = @inspection_id_aprovada AND `status_id` = 1; -- Atualiza todos que ainda estão 'EM_INSPECAO'


-- -----------------------------------------------------------------------------
-- Passo 4: O sistema aplica a regra de avaliação e finaliza a inspeção.
-- Ação: Como todos os itens estão 'CONFORME', o status da inspeção é atualizado para 'APROVADO'.
--       O caminho do PDF gerado é salvo.
-- -----------------------------------------------------------------------------
UPDATE `inspections`
SET
    `status_id` = 2, -- APROVADO
    `end_datetime` = NOW(),
    `generated_pdf_path` = CONCAT('/reports/inspection_', @inspection_id_aprovada, '.pdf')
WHERE id = @inspection_id_aprovada;

-- Verificação: Mostra o status final da inspeção
SELECT id, inspector_name, status_id, generated_pdf_path FROM `inspections` WHERE id = @inspection_id_aprovada;


-- =============================================================================
-- CENÁRIO 2: Inspeção que será REPROVADA
-- =============================================================================

-- Fluxo 2: Realização de uma Nova Inspeção
-- -----------------------------------------------------------------------------
-- Passo 1: O inspetor inicia uma segunda inspeção.
-- -----------------------------------------------------------------------------
START TRANSACTION;

INSERT INTO `inspections` (
    `inspector_name`, `status_id`, `entry_registration`, `vehicle_plates`,
    `modality_id`, `operation_type_id`, `unit_type_id`, `container_type_id`,
    `start_datetime`, `driver_name`
) VALUES (
    'Leonardo Adler', 1, 'REG-2025-DEF', 'ABC-5678',
    1, 2, 1, 3,
    NOW(), 'Maria Condutora'
);
SET @inspection_id_reprovada = LAST_INSERT_ID();
INSERT INTO `inspection_checklist_items` (`inspection_id`, `master_point_id`, `status_id`)
SELECT @inspection_id_reprovada, `id`, 1 FROM `master_inspection_points`;

COMMIT;


-- -----------------------------------------------------------------------------
-- Passo 2: O inspetor avalia a maioria dos pontos como 'CONFORME', mas um como 'NAO_CONFORME'.
-- -----------------------------------------------------------------------------
START TRANSACTION;

-- Avalia 17 pontos como 'CONFORME'
UPDATE `inspection_checklist_items`
SET `status_id` = 2
WHERE `inspection_id` = @inspection_id_reprovada AND `master_point_id` != 16;

-- Avalia o Ponto 16 (EIXO DE TRANSMISSÃO) como 'NAO_CONFORME'
UPDATE `inspection_checklist_items`
SET `status_id` = 3, `observations` = 'Ponto de ferrugem avançada detectado no eixo. Requer manutenção imediata.'
WHERE `inspection_id` = @inspection_id_reprovada AND `master_point_id` = 16;

SET @item_eixo_id = (SELECT id FROM `inspection_checklist_items` WHERE `inspection_id` = @inspection_id_reprovada AND `master_point_id` = 16);
INSERT INTO `item_evidences` (`item_id`, `file_path`, `file_name`, `file_size`, `mime_type`)
VALUES (@item_eixo_id, '/uploads/insp_2/16_timestamp.jpg', 'eixo_danificado.jpg', 2048, 'image/jpeg');

COMMIT;


-- Fluxo 3: Finalização da Inspeção
-- -----------------------------------------------------------------------------
-- Passo 3: O sistema aplica a regra de avaliação.
-- Ação: Como há um item 'NAO_CONFORME', o status da inspeção é atualizado para 'REPROVADO'.
-- -----------------------------------------------------------------------------
UPDATE `inspections`
SET
    `status_id` = 3, -- REPROVADO
    `end_datetime` = NOW(),
    `generated_pdf_path` = CONCAT('/reports/inspection_', @inspection_id_reprovada, '.pdf')
WHERE id = @inspection_id_reprovada;

-- Verificação: Mostra o status final da inspeção reprovada
SELECT id, inspector_name, status_id, generated_pdf_path FROM `inspections` WHERE id = @inspection_id_reprovada;


-- =============================================================================
-- Fluxo 4: Consulta e Análise no Dashboard
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Ação: O usuário visualiza todas as inspeções no dashboard.
-- -----------------------------------------------------------------------------
SELECT
    i.id AS 'ID da Inspeção',
    i.inspector_name AS 'Inspetor',
    ls.name AS 'Status',
    i.start_datetime AS 'Data de Início'
FROM
    `inspections` i
JOIN
    `lookup_statuses` ls ON i.status_id = ls.id
ORDER BY
    i.start_datetime DESC;


-- -----------------------------------------------------------------------------
-- Ação: O usuário clica para ver os detalhes de uma inspeção específica (a reprovada).
-- -----------------------------------------------------------------------------
SELECT
    i.id AS 'ID da Inspeção',
    i.inspector_name AS 'Inspetor',
    ls.name AS 'Status Geral',
    mip.point_number AS 'Ponto',
    mip.name AS 'Item Verificado',
    lci.name AS 'Status do Item',
    ici.observations AS 'Observações',
    ie.file_name AS 'Evidência'
FROM
    `inspections` i
JOIN
    `inspection_checklist_items` ici ON i.id = ici.inspection_id
JOIN
    `master_inspection_points` mip ON ici.master_point_id = mip.id
JOIN
    `lookup_statuses` ls ON i.status_id = ls.id
JOIN
    `lookup_checklist_item_statuses` lci ON ici.status_id = lci.id
LEFT JOIN
    `item_evidences` ie ON ici.id = ie.item_id
WHERE
    i.id = @inspection_id_reprovada
ORDER BY
    mip.point_number;

