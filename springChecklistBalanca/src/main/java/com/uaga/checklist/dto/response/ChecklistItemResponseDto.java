package com.uaga.checklist.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO de Resposta para Item de Checklist")
public class ChecklistItemResponseDto {
    private Long id;
    private String observacoes;

    @Schema(description = "Detalhes do ponto de verificação")
    private PontoVerificacaoResponseDto pontoVerificacao;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes do status de conformidade")
    private LookupValueDataResponseDto statusConformidade;

    @Schema(description = "Lista de evidências associadas ao item")
    private List<EvidenciaResponseDto> evidencias;
}
