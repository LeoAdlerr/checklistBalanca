package com.uaga.checklist.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO de Resposta para um valor de Lookup genérico")
public class LookupValueDataResponseDto {
    private Integer id;
    private String type; // Categoria do lookup (ex: "MODALIDADE", "OPERACAO")
    private String description;
}
