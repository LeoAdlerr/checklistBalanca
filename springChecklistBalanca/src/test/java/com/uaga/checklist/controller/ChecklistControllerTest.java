package com.uaga.checklist.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.uaga.checklist.dto.CreateChecklistDto;
import com.uaga.checklist.dto.ChecklistItemDto;
import com.uaga.checklist.dto.EvidenciaDto;
import com.uaga.checklist.dto.LacreSaidaDto;
import com.uaga.checklist.dto.UpdateChecklistDto;
import com.uaga.checklist.dto.response.ChecklistResponseDto;
import com.uaga.checklist.dto.response.ChecklistItemResponseDto;
import com.uaga.checklist.dto.response.EvidenciaResponseDto;
import com.uaga.checklist.dto.response.LacreSaidaResponseDto;
import com.uaga.checklist.dto.response.LookupValueDataResponseDto;
import com.uaga.checklist.dto.response.PontoVerificacaoResponseDto;
import com.uaga.checklist.service.ChecklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@WebMvcTest(ChecklistController.class)
public class ChecklistControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private ChecklistService checklistService;

        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                objectMapper = new ObjectMapper();
                objectMapper.registerModule(new JavaTimeModule());
                objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        }

        // --- Métodos Auxiliares para criação de DTOs e Entidades de Resposta para
        // Testes ---

        private CreateChecklistDto createSampleCreateChecklistDto() {
                EvidenciaDto evidenciaDto = new EvidenciaDto("https://example.com/foto1.jpg", "Rachadura na parede");
                ChecklistItemDto itemDto = new ChecklistItemDto(11, 402, "Observação item 1",
                                Arrays.asList(evidenciaDto));
                LacreSaidaDto lacreSaidaDto = new LacreSaidaDto(2, 2, 1, "Resp Verif", "Assinatura Resp",
                                LocalDate.of(2025, 6, 11));

                return new CreateChecklistDto(
                                LocalDateTime.of(2025, 6, 11, 10, 0, 0),
                                LocalDateTime.of(2025, 6, 11, 10, 30, 0),
                                101, 201, 301, "LacreUaga1", "LacreUaga2", "Nome Lacre", "Assinatura Lacre",
                                "Nome Deslacre", "Assinatura Deslacre", "LacreArmador", "LacreRFB",
                                "Obs Gerais", "Providencias", "Nome Inspetor", "Assinatura Inspetor",
                                "Assinatura Motorista",
                                Arrays.asList(itemDto), lacreSaidaDto);
        }

        private ChecklistResponseDto createSampleChecklistResponseDto(Long id) {
                LookupValueDataResponseDto tipoInspecao = new LookupValueDataResponseDto(101,
                                "TIPO_INSPECAO_MODALIDADE",
                                "Rodoviário");
                LookupValueDataResponseDto operacao = new LookupValueDataResponseDto(201, "OPERACAO", "Verde");
                LookupValueDataResponseDto tipoUnidade = new LookupValueDataResponseDto(301, "TIPO_UNIDADE",
                                "Container");

                PontoVerificacaoResponseDto pontoVerificacao = new PontoVerificacaoResponseDto(11, "Pneus");
                LookupValueDataResponseDto statusConformidade = new LookupValueDataResponseDto(402,
                                "STATUS_CONFORMIDADE",
                                "Não Conforme");
                EvidenciaResponseDto evidencia = new EvidenciaResponseDto(1L, "https://example.com/foto1.jpg",
                                "Rachadura na parede");
                ChecklistItemResponseDto item = new ChecklistItemResponseDto(1L, "Observação item 1", pontoVerificacao,
                                statusConformidade, Arrays.asList(evidencia));

                LookupValueDataResponseDto lacreRfb = new LookupValueDataResponseDto(2, "COMUM", "OK");
                LookupValueDataResponseDto lacreArmador = new LookupValueDataResponseDto(2, "COMUM", "OK");
                LookupValueDataResponseDto fitaLacre = new LookupValueDataResponseDto(1, "COMUM", "N/A");
                LacreSaidaResponseDto lacreSaida = new LacreSaidaResponseDto(1L, "Resp Verif", "Assinatura Resp",
                                LocalDate.of(2025, 6, 11), lacreRfb, lacreArmador, fitaLacre);

                return new ChecklistResponseDto(
                                id, LocalDateTime.of(2025, 6, 11, 10, 0, 0), LocalDateTime.of(2025, 6, 11, 10, 30, 0),
                                "LacreUaga1", "LacreUaga2", "Nome Lacre", "Assinatura Lacre",
                                "Nome Deslacre", "Assinatura Deslacre", "LacreArmador", "LacreRFB",
                                "Obs Gerais", "Providencias", "Nome Inspetor", "Assinatura Inspetor",
                                "Assinatura Motorista",
                                tipoInspecao, operacao, tipoUnidade, Arrays.asList(item), lacreSaida);
        }

        // --- Testes para o Endpoint POST /api/checklists (createChecklist) ---

        @Test
        void createChecklist_shouldReturnCreatedChecklist() throws Exception {
                // Dado (Given)
                CreateChecklistDto createDto = createSampleCreateChecklistDto();
                ChecklistResponseDto responseDto = createSampleChecklistResponseDto(1L);

                // Quando (When) - Mock do serviço: quando o método createChecklist for chamado
                // com qualquer CreateChecklistDto,
                // ele deve retornar o nosso responseDto de amostra.
                when(checklistService.createChecklist(any(CreateChecklistDto.class))).thenReturn(responseDto);

                // Então (Then) - Simula a requisição POST para /api/checklists
                mockMvc.perform(post("/api/checklists")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createDto))) // Converte DTO para JSON e define
                                                                                      // como corpo da
                                                                                      // requisição
                                .andExpect(status().isCreated()) // Espera que o status HTTP da resposta seja 201
                                                                 // Created
                                .andExpect(jsonPath("$.id").value(1L)) // Verifica o ID retornado no JSON da resposta
                                .andExpect(jsonPath("$.nomeRespInspecao").value("Nome Inspetor")) // Verifica outros
                                                                                                  // campos
                                .andExpect(jsonPath("$.itens[0].observacoes").value("Observação item 1")); // Verifica
                                                                                                           // item
                                                                                                           // aninhado
        }

        @Test
        void createChecklist_shouldReturnBadRequest_whenValidationFails() throws Exception {
                // Dado
                CreateChecklistDto invalidDto = new CreateChecklistDto(); // DTO inválido com campos obrigatórios
                                                                          // nulos/vazios
                invalidDto.setNomeRespInspecao(""); // Campo obrigatório que será inválido

                // Não precisamos mockar o serviço, pois a validação ocorre antes de o
                // controlador chamar o serviço.

                // Então
                mockMvc.perform(post("/api/checklists")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidDto)))
                                .andExpect(status().isBadRequest()); // Espera status 400 Bad Request devido à falha de
                                                                     // validação
        }

        // --- Outros testes (GET, PUT, DELETE) serão adicionados aqui conforme o TDD
        // ---
        // Eles ainda não foram implementados, mas a estrutura estará aqui para
        // referência futura.

        // Dentro da classe ChecklistControllerTest

        @Test
        void getChecklistById_shouldReturnChecklist_whenFound() throws Exception {
                // GIVEN
                Long checklistId = 1L;
                ChecklistResponseDto responseDto = createSampleChecklistResponseDto(checklistId);

                // Mock do serviço para retornar o DTO quando o ID for encontrado
                when(checklistService.getChecklistById(checklistId)).thenReturn(responseDto);

                // WHEN & THEN
                mockMvc.perform(get("/api/checklists/{id}", checklistId)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(checklistId))
                                .andExpect(jsonPath("$.nomeRespInspecao").value("Nome Inspetor"));
        }

        @Test
        void getChecklistById_shouldReturnNotFound_whenNotFound() throws Exception {
                // GIVEN
                Long checklistId = 99L; // ID que não existe

                // Mock do serviço para lançar a exceção NOT_FOUND
                when(checklistService.getChecklistById(checklistId))
                                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Checklist não encontrado"));

                // WHEN & THEN
                mockMvc.perform(get("/api/checklists/{id}", checklistId)
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isNotFound());
        }

        @Test
        void getAllChecklists_shouldReturnListOfChecklists() throws Exception {
                // GIVEN
                ChecklistResponseDto checklist1 = createSampleChecklistResponseDto(1L);
                ChecklistResponseDto checklist2 = createSampleChecklistResponseDto(2L);
                List<ChecklistResponseDto> checklistList = Arrays.asList(checklist1, checklist2);

                // Mock do serviço
                when(checklistService.getAllChecklists()).thenReturn(checklistList);

                // WHEN & THEN
                mockMvc.perform(get("/api/checklists")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.size()").value(2))
                                .andExpect(jsonPath("$[0].id").value(1L))
                                .andExpect(jsonPath("$[1].id").value(2L));
        }

        // Dentro da classe ChecklistControllerTest

        @Test
        void updateChecklist_shouldReturnOk_whenSuccessful() throws Exception {
                // GIVEN
                Long checklistId = 1L;
                UpdateChecklistDto updateDto = new UpdateChecklistDto();
                updateDto.setObservacoesGerais("Observações atualizadas com sucesso.");

                ChecklistResponseDto responseDto = createSampleChecklistResponseDto(checklistId);
                responseDto.setObservacoesGerais(updateDto.getObservacoesGerais());

                // Mock do serviço
                when(checklistService.updateChecklist(eq(checklistId), any(UpdateChecklistDto.class)))
                                .thenReturn(responseDto);

                // WHEN & THEN
                mockMvc.perform(put("/api/checklists/{id}", checklistId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(checklistId))
                                .andExpect(jsonPath("$.observacoesGerais")
                                                .value("Observações atualizadas com sucesso."));
        }

        @Test
        void updateChecklist_shouldReturnNotFound_whenChecklistDoesNotExist() throws Exception {
                // GIVEN
                Long checklistId = 99L; // ID que não existe
                UpdateChecklistDto updateDto = new UpdateChecklistDto();

                // Mock do serviço para lançar a exceção
                when(checklistService.updateChecklist(eq(checklistId), any(UpdateChecklistDto.class)))
                                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

                // WHEN & THEN
                mockMvc.perform(put("/api/checklists/{id}", checklistId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto)))
                                .andExpect(status().isNotFound());
        }

        @Test
        void updateChecklist_shouldReturnBadRequest_whenValidationFails() throws Exception {
                // GIVEN
                Long checklistId = 1L;
                UpdateChecklistDto updateDto = new UpdateChecklistDto();
                updateDto.setDataHoraTermino(LocalDateTime.now()); // Tentando finalizar

                // Mock do serviço para lançar a exceção de regra de negócio
                when(checklistService.updateChecklist(eq(checklistId), any(UpdateChecklistDto.class)))
                                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                                "Todos os itens devem estar 'Conforme' ou 'N/A'."));

                // WHEN & THEN
                mockMvc.perform(put("/api/checklists/{id}", checklistId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void deleteChecklist_shouldReturnNoContent_whenSuccessful() throws Exception {
                // GIVEN
                Long checklistId = 1L;
                // Configura o mock do serviço para não fazer nada (comportamento de sucesso
                // para um método void)
                doNothing().when(checklistService).deleteChecklist(checklistId);

                // WHEN & THEN
                mockMvc.perform(delete("/api/checklists/{id}", checklistId))
                                .andExpect(status().isNoContent()); // Espera o status 204 No Content
        }

        @Test
        void deleteChecklist_shouldReturnBadRequest_whenDeletionIsForbidden() throws Exception {
                // GIVEN
                Long checklistId = 2L; // Um checklist que está finalizado
                // Mock do serviço para lançar a exceção de regra de negócio
                doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Checklists finalizados não podem ser excluídos."))
                                .when(checklistService).deleteChecklist(checklistId);

                // WHEN & THEN
                mockMvc.perform(delete("/api/checklists/{id}", checklistId))
                                .andExpect(status().isBadRequest()); // Espera o status 400 Bad Request
        }

        @Test
        void deleteChecklist_shouldReturnNotFound_whenChecklistDoesNotExist() throws Exception {
                // GIVEN
                Long checklistId = 99L; // Um ID que não existe
                // Mock do serviço para lançar a exceção de "não encontrado"
                doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND))
                                .when(checklistService).deleteChecklist(checklistId);

                // WHEN & THEN
                mockMvc.perform(delete("/api/checklists/{id}", checklistId))
                                .andExpect(status().isNotFound()); // Espera o status 404 Not Found
        }

         @Test
    void getChecklistsByDateRange_whenFound_shouldReturnListOfChecklists() throws Exception {
        // GIVEN
        String startDate = "2025-06-01T00:00:00";
        String endDate = "2025-06-30T23:59:59";
        
        ChecklistResponseDto checklist = createSampleChecklistResponseDto(1L);
        List<ChecklistResponseDto> responseList = Collections.singletonList(checklist);

        // Mock do serviço para retornar a lista quando chamado com as datas corretas.
        when(checklistService.getChecklistsByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(responseList);

        // WHEN & THEN
        mockMvc.perform(get("/api/checklists/search")
                    .param("startDate", startDate)
                    .param("endDate", endDate)
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.size()").value(1))
            .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void getChecklistsByDateRange_whenNotFound_shouldReturnNotFound() throws Exception {
        // GIVEN
        String startDate = "2026-01-01T00:00:00";
        String endDate = "2026-01-31T23:59:59";
        
        // Mock do serviço para lançar a exceção NOT_FOUND.
        when(checklistService.getChecklistsByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        // WHEN & THEN
        mockMvc.perform(get("/api/checklists/search")
                    .param("startDate", startDate)
                    .param("endDate", endDate)
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    @Test
    void getChecklistsByDateRange_whenMissingParams_shouldReturnBadRequest() throws Exception {
        // GIVEN: Uma requisição sem um dos parâmetros obrigatórios (endDate).

        // WHEN & THEN
        mockMvc.perform(get("/api/checklists/search")
                    .param("startDate", "2025-06-01T00:00:00")
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest()); // Espera um erro 400 Bad Request.
    }
    
 // --- Teste para o Endpoint de Geração de PDF ---

    @Test
    void generatePdf_whenChecklistIsValid_shouldReturnPdfFile() throws Exception {
        // GIVEN
        Long checklistId = 1L;
        byte[] pdfBytes = "Sample PDF Content".getBytes(); // Simula o conteúdo de um PDF

        // Mock do serviço para retornar o array de bytes do PDF
        when(checklistService.generateChecklistPdf(checklistId)).thenReturn(pdfBytes);

        // WHEN & THEN
        mockMvc.perform(get("/api/checklists/{id}/pdf", checklistId))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PDF_VALUE))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(pdfBytes));
    }

}
