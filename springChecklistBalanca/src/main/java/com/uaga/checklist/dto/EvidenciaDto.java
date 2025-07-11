package com.uaga.checklist.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO para detalhes de Evidência")
public class EvidenciaDto {
    @Schema(description = "URL ou caminho da imagem de evidência", example = "https://example.com/imagem_pneu_furado.jpg")
    @NotBlank(message = "A URL da imagem não pode estar em branco")
    @Size(max = 255, message = "A URL da imagem não pode ter mais de 255 caracteres")
    private String urlImagem;

    @Schema(description = "Descrição opcional da evidência", example = "Foto do pneu dianteiro esquerdo com furo visível", nullable = true)
    private String descricao; // String é null por padrão se não for fornecida no JSON
}
