package com.uaga.checklist.controller;

import com.uaga.checklist.AbstractIntegrationTest;
import com.uaga.checklist.dto.response.ChecklistResponseDto;
import com.uaga.checklist.entity.Checklist;
import com.uaga.checklist.repository.ChecklistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ChecklistE2ETest extends AbstractIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ChecklistRepository checklistRepository;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @BeforeEach
    void setUp() {
        checklistRepository.deleteAll();
    }

    @Test
    void createChecklist_whenValidBody_shouldSaveAndReturnCreated() {
        // CORREÇÃO: Adicionada a data e hora de início na chamada do método auxiliar.
        String requestBody = createChecklistRequestBody("Ricardo Mendes", LocalDateTime.now().format(formatter));
        HttpEntity<String> requestEntity = createRequestEntity(requestBody);

        ResponseEntity<ChecklistResponseDto> response = restTemplate.exchange(
                getBaseUrl(), HttpMethod.POST, requestEntity, ChecklistResponseDto.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
    }
    
    @Test
    void workflow_deleteInProgress_and_createAndFinalizeNew_shouldSucceed() {
        // CORREÇÃO: Adicionada a data e hora de início nas chamadas dos métodos auxiliares.
        ChecklistResponseDto checklistToDelete = createInitialTestChecklist("Inspetor Com Erro", LocalDateTime.now().minusHours(1).format(formatter));
        Long idToDelete = checklistToDelete.getId();

        restTemplate.delete(getBaseUrl() + "/{id}", idToDelete);
        assertThat(checklistRepository.findById(idToDelete)).isEmpty();

        ChecklistResponseDto checklistToFinalize = createInitialTestChecklist("Inspetor Correto", LocalDateTime.now().minusMinutes(30).format(formatter));
        Long idToFinalize = checklistToFinalize.getId();

        for (int i = 2; i <= 18; i++) {
            String itemJson = String.format("{\"itens\": [{\"pontoVerificacaoId\": %d, \"statusConformidadeId\": 401, \"observacoes\": \"Ponto %d OK.\"}]}", i, i);
            restTemplate.put(getBaseUrl() + "/{id}", createRequestEntity(itemJson), idToFinalize);
        }

        String finalizationBody = String.format("{\"dataHoraTermino\": \"%s\"}", LocalDateTime.now().format(formatter));
        ResponseEntity<ChecklistResponseDto> finalResponse = restTemplate.exchange(
                getBaseUrl() + "/{id}", HttpMethod.PUT, createRequestEntity(finalizationBody), ChecklistResponseDto.class, idToFinalize
        );
        assertThat(finalResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(finalResponse.getBody().getDataHoraTermino()).isNotNull();
    }

    @Test
    void getChecklistsByDateRange_shouldReturnMatchingChecklists() {
        // CORREÇÃO: Adicionada a data e hora de início nas chamadas dos métodos auxiliares.
        createInitialTestChecklist("Inspetor Dia 15-A", "2025-06-15T09:00:00");
        createInitialTestChecklist("Inspetor Dia 15-B", "2025-06-15T14:30:00");
        createInitialTestChecklist("Inspetor Dia 16", "2025-06-16T11:00:00");

        String url = UriComponentsBuilder.fromHttpUrl(getBaseUrl() + "/search")
                .queryParam("startDate", "2025-06-15T00:00:00")
                .queryParam("endDate", "2025-06-15T23:59:59")
                .toUriString();

        ResponseEntity<List<ChecklistResponseDto>> response = restTemplate.exchange(
            url, HttpMethod.GET, null, new ParameterizedTypeReference<>() {}
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<ChecklistResponseDto> foundChecklists = response.getBody();
        assertThat(foundChecklists).isNotNull().hasSize(2);
    }
    
    @Test
    void generatePdf_whenChecklistIsComplete_shouldReturnPdfFile() {
        // CORREÇÃO: Adicionada a data e hora de início na chamada do método auxiliar.
        ChecklistResponseDto createdChecklist = createInitialTestChecklist("Inspetor do PDF", "2025-06-16T10:00:00");
        Long checklistId = createdChecklist.getId();

        for (int i = 2; i <= 18; i++) {
            String itemJson = String.format("{\"itens\": [{\"pontoVerificacaoId\": %d, \"statusConformidadeId\": 401, \"observacoes\": \"Ponto %d OK.\"}]}", i, i);
            restTemplate.put(getBaseUrl() + "/{id}", createRequestEntity(itemJson), checklistId);
        }

        ResponseEntity<byte[]> response = restTemplate.getForEntity(
                getBaseUrl() + "/{id}/pdf", byte[].class, checklistId
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        // CORREÇÃO: A asserção correta para um array não vazio.
        assertThat(response.getBody()).isNotNull().isNotEmpty();
    }


    // --- MÉTODOS AUXILIARES ---

    private String getBaseUrl() {
        return "http://localhost:" + port + "/api/checklists";
    }

    private HttpEntity<String> createRequestEntity(String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
    
    private ChecklistResponseDto createInitialTestChecklist(String inspectorName, String startTime) {
        String requestBody = createChecklistRequestBody(inspectorName, startTime);
        ResponseEntity<ChecklistResponseDto> response = restTemplate.postForEntity(
                getBaseUrl(), createRequestEntity(requestBody), ChecklistResponseDto.class
        );
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        return response.getBody();
    }

    private String createChecklistRequestBody(String inspectorName, String startTime) {
        String exitDate = LocalDateTime.parse(startTime, formatter).toLocalDate().toString();
        return String.format("""
        {
          "dataHoraInicio": "%s",
          "tipoInspecaoModalidadeId": 101, "operacaoId": 201, "tipoUnidadeId": 301,
          "nomeRespInspecao": "%s",
          "assinaturaRespInspecao": "assinatura_inspetor.png",
          "nLacreUagaPosInspecao": "UAGA-INSP-123",
          "nLacreUagaPosCarregamento": "UAGA-CARGA-456",
          "nomeRespLacre": "Resp Lacre",
          "assinaturaRespLacre": "assinatura_lacre.png",
          "nomeRespDeslacrePosCarregamento": "Resp Deslacre",
          "assinaturaRespDeslacrePosCarregamento": "assinatura_deslacre.png",
          "nLacreArmador": "ARMADOR-XYZ",
          "nLacreRfb": "RFB-789",
          "observacoesGerais": "Observação inicial.",
          "providenciasTomadas": "Nenhuma.",
          "assinaturaMotorista": "assinatura_motorista.png",
          "itens": [{"pontoVerificacaoId": 1, "statusConformidadeId": 401, "observacoes": "Item inicial OK"}],
          "lacresSaida": {
              "lacreRfbId": 2, 
              "lacreArmadorPosUnitizacaoId": 2, 
              "fitaLacreUagaCompartimentoId": 1, 
              "nomeRespVerificacao": "Resp Verificação", 
              "assinaturaRespVerificacao": "assinatura_verificacao.png", 
              "dataSaida": "%s"
          }
        }
        """, startTime, inspectorName, exitDate);
    }
}
