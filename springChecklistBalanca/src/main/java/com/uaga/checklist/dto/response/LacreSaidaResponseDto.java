package com.uaga.checklist.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO de Resposta para Lacres de Saída")
public class LacreSaidaResponseDto {
    private Long id;
    private String nomeRespVerificacao;
    private String assinaturaRespVerificacao;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dataSaida;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes do status do lacre RFB")
    private LookupValueDataResponseDto lacreRfb;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes do status do lacre Armador")
    private LookupValueDataResponseDto lacreArmadorPosUnitizacao;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes do status da fita lacre UAGA")
    private LookupValueDataResponseDto fitaLacreUagaCompartimento;
}
