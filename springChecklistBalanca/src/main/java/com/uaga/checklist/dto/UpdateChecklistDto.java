package com.uaga.checklist.dto;

import com.fasterxml.jackson.annotation.JsonFormat; // Import Jackson annotation
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

// This DTO represents a partial update, so all fields are optional.
// NotNull/NotBlank validation is omitted for String/Integer fields that can be null in an update.
// For nested fields (Lists/Objects), @Valid can still be used if the object/item is provided.

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para atualização parcial de um Checklist existente")
public class UpdateChecklistDto {
    @Schema(description = "Data e hora de início da inspeção no formato YYYY-MM-DDTHH:MM:SS", example = "2025-05-30T10:00:00", nullable = true)
    @PastOrPresent(message = "A data e hora de início não pode ser uma data futura")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") // Explicitly define JSON format
    private LocalDateTime dataHoraInicio;

    @Schema(description = "Data e hora de término da inspeção no formato YYYY-MM-DDTHH:MM:SS", example = "2025-05-30T10:30:00", nullable = true)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") // Explicitly define JSON format
    private LocalDateTime dataHoraTermino;

    @Schema(description = "ID do tipo de inspeção por modalidade (e.g., 1 para Rodoviário)", example = "1", nullable = true)
    private Integer tipoInspecaoModalidadeId;

    @Schema(description = "ID da operação (e.g., 1 para Verde)", example = "1", nullable = true)
    private Integer operacaoId;

    @Schema(description = "ID do tipo de unidade (e.g., 1 para Container)", example ="1", nullable = true)
    private Integer tipoUnidadeId;

    @Schema(description = "Número do Lacre UAGA (Pós-Inspeção)", example = "UAGA12345_UPDATED", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre UAGA (Pós-Inspeção) não pode ter mais de 255 caracteres")
    private String nLacreUagaPosInspecao;

    @Schema(description = "Número do Lacre UAGA (Pós-Carregamento)", example = "UAGA67890_UPDATED", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre UAGA (Pós-Carregamento) não pode ter mais de 255 caracteres")
    private String nLacreUagaPosCarregamento;

    @Schema(description = "Nome do responsável pelo Lacre, Deslacre e Relacre", example = "Carlos Santos Updated", nullable = true)
    @Size(max = 255, message = "O nome do responsável pelo Lacre não pode ter mais de 255 caracteres")
    private String nomeRespLacre;

    @Schema(description = "URL ou hash da assinatura digital do responsável pelo Lacre", example = "url_assinatura_carlos_lacre_updated.png", nullable = true)
    private String assinaturaRespLacre;

    @Schema(description = "Nome do responsável pelo Deslacre Pós-Carregamento", example = "Ana Souza Updated", nullable = true)
    @Size(max = 255, message = "O nome do responsável pelo Deslacre não pode ter mais de 255 caracteres")
    private String nomeRespDeslacrePosCarregamento;

    @Schema(description = "URL ou hash da assinatura digital do responsável pelo Deslacre Pós-Carregamento", example = "url_assinatura_ana_deslacre_updated.png", nullable = true)
    @Size(max = 255, message = "O nome do responsável pelo Deslacre não pode ter mais de 255 caracteres")
    private String assinaturaRespDeslacrePosCarregamento;

    @Schema(description = "Número do Lacre do Armador", example = "ARMADOR001_UPDATED", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre do Armador não pode ter mais de 255 caracteres")
    private String nLacreArmador;

    @Schema(description = "Número do Lacre RFB", example = "RFB123_UPDATED", nullable = true)
    @Size(max = 255, message = "O Nº do Lacre RFB não pode ter mais de 255 caracteres")
    private String nLacreRfb;

    @Schema(description = "Observações gerais da inspeção", example = "Observações gerais atualizadas.", nullable = true)
    private String observacoesGerais;

    @Schema(description = "Providências tomadas durante a inspeção", example = "Providências atualizadas.", nullable = true)
    private String providenciasTomadas;

    @Schema(description = "Nome do responsável pela inspeção", example = "João Silva Updated", nullable = true)
    @Size(max = 255, message = "O nome do responsável pela inspeção não pode ter mais de 255 caracteres")
    private String nomeRespInspecao;

    @Schema(description = "URL ou hash da assinatura digital do responsável pela inspeção", example = "url_assinatura_joao_inspetor_updated.png", nullable = true)
    private String assinaturaRespInspecao;

    @Schema(description = "URL ou hash da assinatura digital do motorista", example = "url_assinatura_motorista_x_updated.png", nullable = true)
    private String assinaturaMotorista;

    @Schema(description = "Lista dos 18 pontos de verificação do veículo (atualização)", nullable = true)
    @Valid // Validates nested DTOs within the list, if the list is provided
    private List<ChecklistItemDto> itens; // Items can be updated or replaced

    @Schema(description = "Informações finais de verificação de lacres de saída (atualização)", nullable = true)
    @Valid // Validates nested DTO, if the object is provided
    private LacreSaidaDto lacresSaida;
}
