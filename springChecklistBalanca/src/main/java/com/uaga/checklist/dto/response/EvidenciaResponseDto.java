package com.uaga.checklist.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO de Resposta para Evidência")
public class EvidenciaResponseDto {
    private Long id;
    private String urlImagem;
    private String descricao;
}
