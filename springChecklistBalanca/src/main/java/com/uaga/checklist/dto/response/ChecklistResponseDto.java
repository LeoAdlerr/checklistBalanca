package com.uaga.checklist.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO de Resposta para um Checklist completo")
public class ChecklistResponseDto {
    private Long id;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraTermino;
    private String nLacreUagaPosInspecao;
    private String nLacreUagaPosCarregamento;
    private String nomeRespLacre;
    private String assinaturaRespLacre;
    private String nomeRespDeslacrePosCarregamento;
    private String assinaturaRespDeslacrePosCarregamento;
    private String nLacreArmador;
    private String nLacreRfb;
    private String observacoesGerais;
    private String providenciasTomadas;
    private String nomeRespInspecao;
    private String assinaturaRespInspecao;
    private String assinaturaMotorista;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes do tipo de inspeção por modalidade")
    private LookupValueDataResponseDto tipoInspecaoModalidade;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes da operação")
    private LookupValueDataResponseDto operacao;

    // Atualizado para usar o DTO genérico de lookup
    @Schema(description = "Detalhes do tipo de unidade")
    private LookupValueDataResponseDto tipoUnidade;

    @Schema(description = "Lista de itens do checklist")
    private List<ChecklistItemResponseDto> itens;

    @Schema(description = "Informações de lacres de saída")
    private LacreSaidaResponseDto lacreSaida;
}
