package com.uaga.checklist.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para um Item de Checklist (ponto de verificação)")
public class ChecklistItemDto {
    @Schema(description = "ID do ponto de verificação (e.g., 11 para Pneus, 12 para Piso)", example = "11")
    @NotNull(message = "O ID do ponto de verificação não pode ser nulo")
    @Min(value = 1, message = "O ID do ponto de verificação deve ser maior ou igual a 1")
    private Integer pontoVerificacaoId;

    @Schema(description = "ID do status de conformidade (e.g., 1 para Conforme, 2 para Não Conforme)", example = "1")
    @NotNull(message = "O ID do status de conformidade não pode ser nulo")
    @Min(value = 1, message = "O ID do status de conformidade deve ser maior ou igual a 1")
    private Integer statusConformidadeId;

    @Schema(description = "Observações adicionais para o ponto de verificação", example = "Pneus desgastados, requerem troca imediata.", nullable = true)
    private String observacoes;

    @Schema(description = "Lista de evidências (imagens) se o ponto não estiver conforme", nullable = true)
    @Valid // Valida a lista de DTOs aninhados
    private List<EvidenciaDto> evidencias;
}
