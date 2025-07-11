package com.uaga.checklist.dto;

import com.fasterxml.jackson.annotation.JsonFormat; // Import Jackson annotation
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para informações de Lacres de Saída")
public class LacreSaidaDto {
    @Schema(description = "ID do status do lacre RFB (e.g., 2 para OK, 3 para Não OK)", example = "2")
    @NotNull(message = "O ID do lacre RFB não pode ser nulo")
    private Integer lacreRfbId;

    @Schema(description = "ID do status do lacre Armador (e.g., 1 para N/A, 2 para OK, 3 para Não OK)", example = "2")
    @NotNull(message = "O ID do lacre Armador não pode ser nulo")
    private Integer lacreArmadorPosUnitizacaoId;

    @Schema(description = "ID do status da fita lacre UAGA Compartimento (e.g., 1 para N/A, 2 para OK, 3 para Não OK)", example = "1")
    @NotNull(message = "O ID da fita lacre UAGA não pode ser nulo")
    private Integer fitaLacreUagaCompartimentoId;

    @Schema(description = "Nome do responsável pela verificação dos lacres", example = "Mariana Lima")
    @NotBlank(message = "O nome do responsável pela verificação não pode estar em branco")
    @Size(max = 255, message = "O nome do responsável pela verificação não pode ter mais de 255 caracteres")
    private String nomeRespVerificacao;

    @Schema(description = "URL ou hash da assinatura digital do responsável pela verificação", example = "url_assinatura_mariana.png")
    @NotBlank(message = "A assinatura do responsável pela verificação não pode estar em branco")
    private String assinaturaRespVerificacao;

    @Schema(description = "Data de saída no formato YYYY-MM-DD", example = "2025-05-30")
    @NotNull(message = "A data de saída não pode ser nula")
    @PastOrPresent(message = "A data de saída não pode ser uma data futura")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // Explicitly define JSON format
    private LocalDate dataSaida;
}
