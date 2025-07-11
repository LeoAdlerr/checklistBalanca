package com.uaga.checklist.dto;

import com.fasterxml.jackson.annotation.JsonFormat; // Import Jackson annotation
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import com.uaga.checklist.dto.LacreSaidaDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para criação de um novo Checklist completo")
public class CreateChecklistDto {
    @Schema(description = "Data e hora de início da inspeção no formato YYYY-MM-DDTHH:MM:SS", example = "2025-05-30T10:00:00")
    @NotNull(message = "A data e hora de início não pode ser nula")
    @PastOrPresent(message = "A data e hora de início não pode ser uma data futura")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") // Explicitly define JSON format
    private LocalDateTime dataHoraInicio;

    @Schema(description = "Data e hora de término da inspeção no formato YYYY-MM-DDTHH:MM:SS", example = "2025-05-30T10:30:00", nullable = true)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") // Explicitly define JSON format
    private LocalDateTime dataHoraTermino;

    @Schema(description = "ID do tipo de inspeção por modalidade (e.g., 1 para Rodoviário)", example = "1")
    @NotNull(message = "O ID da modalidade de inspeção não pode ser nulo")
    private Integer tipoInspecaoModalidadeId;

    @Schema(description = "ID da operação (e.g., 1 para Verde)", example = "1")
    @NotNull(message = "O ID da operação não pode ser nulo")
    private Integer operacaoId;

    @Schema(description = "ID do tipo de unidade (e.g., 1 para Container)", example = "1")
    @NotNull(message = "O ID do tipo de unidade não pode ser nulo")
    private Integer tipoUnidadeId;

    @Schema(description = "Número do Lacre UAGA (Pós-Inspeção)", example = "UAGA12345", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre UAGA (Pós-Inspeção) não pode ter mais de 255 caracteres")
    private String nLacreUagaPosInspecao;

    @Schema(description = "Número do Lacre UAGA (Pós-Carregamento)", example = "UAGA67890", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre UAGA (Pós-Carregamento) não pode ter mais de 255 caracteres")
    private String nLacreUagaPosCarregamento;

    @Schema(description = "Nome do responsável pelo Lacre, Deslacre e Relacre", example = "Carlos Santos", nullable = true)
    @Size(max = 255, message = "O nome do responsável pelo Lacre não pode ter mais de 255 caracteres")
    private String nomeRespLacre;

    @Schema(description = "URL ou hash da assinatura digital do responsável pelo Lacre", example = "url_assinatura_carlos_lacre.png", nullable = true)
    private String assinaturaRespLacre;

    @Schema(description = "Nome do responsável pelo Deslacre Pós-Carregamento", example = "Ana Souza", nullable = true)
    @Size(max = 255, message = "O nome do responsável pelo Deslacre não pode ter mais de 255 caracteres")
    private String nomeRespDeslacrePosCarregamento;

    @Schema(description = "URL ou hash da assinatura digital do responsável pelo Deslacre Pós-Carregamento", example = "url_assinatura_ana_deslacre.png", nullable = true)
    private String assinaturaRespDeslacrePosCarregamento;

    @Schema(description = "Número do Lacre do Armador", example = "ARMADOR001", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre do Armador não pode ter mais de 255 caracteres")
    private String nLacreArmador;

    @Schema(description = "Número do Lacre RFB", example = "RFB123", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre RFB não pode ter mais de 255 caracteres")
    private String nLacreRfb;

    @Schema(description = "Observações gerais da inspeção", example = "Inspeção padrão sem intercorrências.", nullable = true)
    private String observacoesGerais;

    @Schema(description = "Providências tomadas durante a inspeção", example = "Nenhuma providência necessária.", nullable = true)
    private String providenciasTomadas;

    @Schema(description = "Nome do responsável pela inspeção", example = "João Silva")
    @NotBlank(message = "O nome do responsável pela inspeção não pode estar em branco")
    @Size(max = 255, message = "O nome do responsável pela inspeção não pode ter mais de 255 caracteres")
    private String nomeRespInspecao;

    @Schema(description = "URL ou hash da assinatura digital do responsável pela inspeção", example = "url_assinatura_joao_inspetor.png")
    @NotBlank(message = "A assinatura do responsável pela inspeção não pode estar em branco")
    private String assinaturaRespInspecao;

    @Schema(description = "URL ou hash da assinatura digital do motorista", example = "url_assinatura_motorista_x.png", nullable = true)
    private String assinaturaMotorista;

    @Schema(description = "Lista dos 18 pontos de verificação do veículo")
    @NotNull(message = "A lista de itens do checklist não pode ser nula")
    @NotEmpty(message = "A lista de itens do checklist não pode estar vazia")
    @Valid // Valida os DTOs aninhados dentro da lista
    private List<ChecklistItemDto> itens;

    @Schema(description = "Informações finais de verificação de lacres de saída")
    @NotNull(message = "As informações de lacres de saída não podem ser nulas")
    @Valid // Valida o DTO aninhado
    private LacreSaidaDto lacresSaida;
}
