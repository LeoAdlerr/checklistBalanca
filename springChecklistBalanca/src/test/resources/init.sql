-- Desativa a checagem de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Drop Tables em ordem reversa de dependência (Crucial para recriar o esquema do zero)
DROP TABLE IF EXISTS lacres_saida;
DROP TABLE IF EXISTS evidencias;
DROP TABLE IF EXISTS checklist_itens;
DROP TABLE IF EXISTS checklists;
DROP TABLE IF EXISTS pontos_verificacao;

-- DROP DAS ANTIGAS TABELAS DE TRADUÇÃO (AGORA REMOVIDAS)
DROP TABLE IF EXISTS tipo_inspecao_modalidade_lookup;
DROP TABLE IF EXISTS operacao_lookup;
DROP TABLE IF EXISTS tipo_unidade_lookup;
DROP TABLE IF EXISTS status_conformidade_lookup;
DROP TABLE IF EXISTS lacre_rfb_lookup;
DROP TABLE IF EXISTS lacre_armador_pos_unitizacao_lookup;
DROP TABLE IF EXISTS fita_lacre_uaga_compartimento_lookup;

-- =======================================================
-- NOVA TABELA DE TRADUÇÃO ÚNICA (Lookup Table)
-- =======================================================

CREATE TABLE lookup_value_data (
    id INT PRIMARY KEY, -- SEM AUTO_INCREMENT
    type VARCHAR(50) NOT NULL, -- Categoria do valor (ex: 'MODALIDADE', 'OPERACAO', 'STATUS_CONFORMIDADE')
    description VARCHAR(255) NOT NULL, -- A descrição legível
    UNIQUE (type, description) -- Garante que a combinação tipo+descrição seja única
);

-- =======================================================
-- Tabelas Principais (Usando Chaves Estrangeiras para a Tabela Única de Lookup)
-- =======================================================

-- Tabela principal para os Checklists
CREATE TABLE checklists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    data_hora_inicio DATETIME NOT NULL,
    data_hora_termino DATETIME,
    -- Agora com FKs para a tabela única de lookup
    tipo_inspecao_modalidade_id INT NOT NULL,
    operacao_id INT NOT NULL,
    tipo_unidade_id INT NOT NULL,
    n_lacre_uaga_pos_inspecao VARCHAR(255),
    n_lacre_uaga_pos_carregamento VARCHAR(255),
    nome_resp_lacre VARCHAR(255),
    assinatura_resp_lacre TEXT,
    nome_resp_deslacre_pos_carregamento VARCHAR(255),
    assinatura_resp_deslacre_pos_carregamento TEXT,
    n_lacre_armador VARCHAR(255),
    n_lacre_rfb VARCHAR(255),
    observacoes_gerais TEXT,
    providencias_tomadas TEXT,
    nome_resp_inspecao VARCHAR(255) NOT NULL,
    assinatura_resp_inspecao TEXT NOT NULL,
    assinatura_motorista TEXT,

    -- Foreign Key Constraints nomeadas (apontando para lookup_value_data)
    CONSTRAINT fk_checklists_tipo_inspecao_modalidade FOREIGN KEY (tipo_inspecao_modalidade_id) REFERENCES lookup_value_data(id),
    CONSTRAINT fk_checklists_operacao FOREIGN KEY (operacao_id) REFERENCES lookup_value_data(id),
    CONSTRAINT fk_checklists_tipo_unidade FOREIGN KEY (tipo_unidade_id) REFERENCES lookup_value_data(id)
);

-- Tabela para os Pontos de Verificação (fixos e pré-definidos)
CREATE TABLE pontos_verificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL UNIQUE
);

-- Tabela de ligação para os detalhes de cada ponto verificado em um Checklist
CREATE TABLE checklist_itens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL,
    ponto_verificacao_id INT NOT NULL,
    status_conformidade_id INT NOT NULL, -- Agora FK para lookup_value_data
    observacoes TEXT,

    CONSTRAINT fk_checklist_itens_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_checklist_itens_ponto_verificacao FOREIGN KEY (ponto_verificacao_id) REFERENCES pontos_verificacao(id),
    CONSTRAINT fk_checklist_itens_status_conformidade FOREIGN KEY (status_conformidade_id) REFERENCES lookup_value_data(id)
);

-- Tabela para armazenar as URLs das imagens de evidência
CREATE TABLE evidencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_item_id BIGINT NOT NULL,
    url_imagem VARCHAR(255) NOT NULL,
    descricao TEXT,
    CONSTRAINT fk_evidencias_checklist_item FOREIGN KEY (checklist_item_id) REFERENCES checklist_itens(id) ON DELETE CASCADE
);

-- Tabela para a Verificação de Lacres de Saída (informações específicas de saída)
CREATE TABLE lacres_saida (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    checklist_id BIGINT NOT NULL UNIQUE,
    lacre_rfb_id INT NOT NULL, -- Agora FK para lookup_value_data
    lacre_armador_pos_unitizacao_id INT NOT NULL, -- Agora FK para lookup_value_data
    fita_lacre_uaga_compartimento_id INT NOT NULL, -- Agora FK para lookup_value_data
    nome_resp_verificacao VARCHAR(255) NOT NULL,
    assinatura_resp_verificacao TEXT NOT NULL,
    data_saida DATE NOT NULL,

    CONSTRAINT fk_lacres_saida_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_lacres_saida_lacre_rfb FOREIGN KEY (lacre_rfb_id) REFERENCES lookup_value_data(id),
    CONSTRAINT fk_lacres_saida_lacre_armador_pos_unitizacao FOREIGN KEY (lacre_armador_pos_unitizacao_id) REFERENCES lookup_value_data(id),
    CONSTRAINT fk_lacres_saida_fita_lacre_uaga_compartimento FOREIGN KEY (fita_lacre_uaga_compartimento_id) REFERENCES lookup_value_data(id)
);

-- Reativa a checagem de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================
-- Inserção dos Dados na Tabela Única de Tradução (Lookup Table)
-- Os IDs são fixos para garantir consistência entre ambientes.
-- =======================================================

-- IDs Comuns (serão usados em vários tipos de lookup)
INSERT INTO lookup_value_data (id, type, description) VALUES
(1, 'COMUM', 'N/A'),
(2, 'COMUM', 'OK'),
(3, 'COMUM', 'Não OK');

-- Tipos de Inspeção por Modalidade
INSERT INTO lookup_value_data (id, type, description) VALUES
(101, 'TIPO_INSPECAO_MODALIDADE', 'Rodoviário'),
(102, 'TIPO_INSPECAO_MODALIDADE', 'Aéreo'),
(103, 'TIPO_INSPECAO_MODALIDADE', 'Marítimo');

-- Operação
INSERT INTO lookup_value_data (id, type, description) VALUES
(201, 'OPERACAO', 'Verde'),
(202, 'OPERACAO', 'Laranja'),
(203, 'OPERACAO', 'Vermelho');

-- Tipo de Unidade
INSERT INTO lookup_value_data (id, type, description) VALUES
(301, 'TIPO_UNIDADE', 'Container'),
(302, 'TIPO_UNIDADE', 'Baú');

-- Status de Conformidade
INSERT INTO lookup_value_data (id, type, description) VALUES
(401, 'STATUS_CONFORMIDADE', 'Conforme'),
(402, 'STATUS_CONFORMIDADE', 'Não Conforme'),
-- ID 1 ('N/A') já está em 'COMUM' e pode ser referenciado aqui se necessário
(403, 'STATUS_CONFORMIDADE', 'N/A');

-- Lacre RFB (usará IDs comuns 2 e 3)
-- Lacre Armador Pós-Unitização (usará IDs comuns 1, 2 e 3)
-- Fita Lacre UAGA Compartimento (usará IDs comuns 1, 2 e 3)

-- =======================================================
-- Inserção dos Pontos de Verificação padrão (MESMO CONTEÚDO)
-- =======================================================
INSERT INTO pontos_verificacao (descricao) VALUES
('Seção Inferior (Parte debaixo do Contêiner ou Baú)'),
('Porta (Interior e Exterior) Incluindo Selos'),
('Lateral Direita'),
('Lateral Esquerda'),
('Parede Frontal'),
('Teto'),
('Piso/Assoalho (Interior)'),
('Identificação de Pragas Visíveis'),
('Para-choques'),
('Motor'),
('Pneus'),
('Piso do Caminhão'),
('Tanque de Combustível'),
('Cabine'),
('Tanque de Ar'),
('Eixo de Transmissão'),
('Área da 5ª Roda'),
('Sistema de Exaustão (Escapamento)');
