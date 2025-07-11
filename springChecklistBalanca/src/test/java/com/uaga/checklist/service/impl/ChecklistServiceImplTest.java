package com.uaga.checklist.service.impl;

import com.uaga.checklist.dto.ChecklistItemDto;
import com.uaga.checklist.dto.CreateChecklistDto;
import com.uaga.checklist.dto.EvidenciaDto;
import com.uaga.checklist.dto.LacreSaidaDto;
import com.uaga.checklist.dto.UpdateChecklistDto;
import com.uaga.checklist.dto.response.ChecklistResponseDto;
import com.uaga.checklist.entity.Checklist;
import com.uaga.checklist.entity.ChecklistItem;
import com.uaga.checklist.entity.LacreSaida;
import com.uaga.checklist.entity.LookupValueData;
import com.uaga.checklist.entity.PontoVerificacao;
import com.uaga.checklist.repository.*;
import com.uaga.checklist.service.ChecklistService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Testes de unidade para a classe ChecklistServiceImpl.
 * Utiliza Mockito para simular o comportamento dos repositórios.
 */
@ExtendWith(MockitoExtension.class)
public class ChecklistServiceImplTest {

    @Mock
    private ChecklistRepository checklistRepository;
    @Mock
    private ChecklistItemRepository checklistItemRepository;
    @Mock
    private EvidenciaRepository evidenciaRepository;
    @Mock
    private LacreSaidaRepository lacreSaidaRepository;
    @Mock
    private PontoVerificacaoRepository pontoVerificacaoRepository;
    @Mock
    private LookupValueDataRepository lookupValueDataRepository;

    @InjectMocks
    private ChecklistServiceImpl checklistService;

    // --- Constantes para Testes ---
    private static final int STATUS_CONFORME_ID = 401;
    private static final int STATUS_NAO_CONFORME_ID = 402;
    private static final int STATUS_NAO_SE_APLICA_ID = 403;
    private static final long TOTAL_PONTOS_VERIFICACAO = 18L;

    // --- Métodos Auxiliares ---
    private CreateChecklistDto createSampleCreateChecklistDto() {
        return new CreateChecklistDto(LocalDateTime.now(), null, 101, 201, 301, "L1", "L2", "Resp Lacre", "Ass Lacre", "Resp Deslacre", "Ass Deslacre", "Armador1", "RFB1", "Obs", "Prov", "Inspetor", "Ass Insp", "Ass Mot", Collections.emptyList(), null);
    }

    // --- Testes para createChecklist ---
    @Test
    void createChecklist_shouldCreateAndReturnChecklist() {
        // Dado
        // CORREÇÃO: Usa o método auxiliar para criar um DTO com dados válidos.
        CreateChecklistDto createDto = createSampleCreateChecklistDto(); 
        Checklist checklistEntity = new Checklist();
        checklistEntity.setId(1L);

        // Mock para as buscas de lookups e pontos de verificação
        when(lookupValueDataRepository.findById(any(Integer.class))).thenReturn(Optional.of(new LookupValueData()));
        
        // Mock crucial: Quando o save for chamado, retorna a entidade com ID.
        when(checklistRepository.save(any(Checklist.class))).thenReturn(checklistEntity);

        // Quando
        ChecklistResponseDto result = checklistService.createChecklist(createDto);

        // Então
        assertNotNull(result, "O resultado não deveria ser nulo");
        assertEquals(1L, result.getId());
        verify(checklistRepository).save(any(Checklist.class));
    }

    @Test
    void createChecklist_shouldThrowException_whenLookupNotFound() {
        // Dado
        CreateChecklistDto createDto = createSampleCreateChecklistDto();
        createDto.setTipoInspecaoModalidadeId(999); // ID inválido

        // Mock para simular que o lookup não foi encontrado
        when(lookupValueDataRepository.findById(999)).thenReturn(Optional.empty());

        // Então
        assertThrows(ResponseStatusException.class, () -> {
            // Quando
            checklistService.createChecklist(createDto);
        });
        verify(checklistRepository, never()).save(any(Checklist.class));
    }

    // --- Testes para getChecklistById ---
    @Test
    void getChecklistById_whenChecklistExists_shouldReturnChecklist() {
        Long checklistId = 1L;
        Checklist checklist = new Checklist();
        checklist.setId(checklistId);

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));

        ChecklistResponseDto foundDto = checklistService.getChecklistById(checklistId);

        assertNotNull(foundDto);
        assertEquals(checklistId, foundDto.getId());
    }

    // --- Testes para getAllChecklists ---
    @Test
    void getAllChecklists_whenChecklistsExist_shouldReturnList() {
        Checklist c1 = new Checklist(); c1.setId(1L);
        Checklist c2 = new Checklist(); c2.setId(2L);
        when(checklistRepository.findAll()).thenReturn(Arrays.asList(c1, c2));

        List<ChecklistResponseDto> result = checklistService.getAllChecklists();
        
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    // --- Testes para updateChecklist ---
    @Test
    void updateChecklist_whenAddingNewItem_shouldSucceed() {
        // Dado
        Long checklistId = 1L;
        Checklist existingChecklist = new Checklist();
        existingChecklist.setId(checklistId);
        existingChecklist.setItens(new ArrayList<>());
        
        UpdateChecklistDto updateDto = new UpdateChecklistDto();
        ChecklistItemDto newItemDto = new ChecklistItemDto(2, STATUS_CONFORME_ID, "Porta OK", null);
        updateDto.setItens(List.of(newItemDto));

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(existingChecklist));
        when(pontoVerificacaoRepository.findById(2)).thenReturn(Optional.of(new PontoVerificacao()));
        when(lookupValueDataRepository.findById(STATUS_CONFORME_ID)).thenReturn(Optional.of(new LookupValueData()));
        when(checklistItemRepository.save(any(ChecklistItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(checklistRepository.save(any(Checklist.class))).thenAnswer(inv -> inv.getArgument(0));

        // Quando
        checklistService.updateChecklist(checklistId, updateDto);

        // Então
        verify(checklistRepository).save(argThat(saved -> saved.getItens().size() == 1));
    }

    @Test
    void updateChecklist_whenFinalizingAndAllConditionsMet_shouldSucceed() {
        // Dado
        Long checklistId = 1L;
        UpdateChecklistDto updateDto = new UpdateChecklistDto();
        updateDto.setDataHoraTermino(LocalDateTime.now());

        Checklist existingChecklist = new Checklist();
        existingChecklist.setItens(new ArrayList<>());
        for (int i = 0; i < TOTAL_PONTOS_VERIFICACAO; i++) {
            ChecklistItem item = new ChecklistItem();
            item.setStatusConformidade(new LookupValueData(STATUS_CONFORME_ID, null, null));
            existingChecklist.getItens().add(item);
        }

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(existingChecklist));
        when(pontoVerificacaoRepository.count()).thenReturn(TOTAL_PONTOS_VERIFICACAO);
        when(checklistRepository.save(any(Checklist.class))).thenAnswer(inv -> inv.getArgument(0));

        // Quando
        checklistService.updateChecklist(checklistId, updateDto);

        // Então
        verify(checklistRepository).save(argThat(saved -> saved.getDataHoraTermino() != null));
    }

    @Test
    void updateChecklist_whenFinalizingButNotAllPointsArePresent_shouldThrowException() {
        // Dado
        Long checklistId = 1L;
        UpdateChecklistDto updateDto = new UpdateChecklistDto();
        updateDto.setDataHoraTermino(LocalDateTime.now());

        Checklist existingChecklist = new Checklist();
        existingChecklist.setItens(Collections.singletonList(new ChecklistItem())); // Apenas 1 item

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(existingChecklist));
        when(pontoVerificacaoRepository.count()).thenReturn(TOTAL_PONTOS_VERIFICACAO);

        // Quando & Então
        assertThrows(ResponseStatusException.class, () -> checklistService.updateChecklist(checklistId, updateDto));
    }

    @Test
    void updateChecklist_whenFinalizingButOneItemIsNotConforme_shouldThrowException() {
        // Dado
        Long checklistId = 1L;
        UpdateChecklistDto updateDto = new UpdateChecklistDto();
        updateDto.setDataHoraTermino(LocalDateTime.now());

        Checklist existingChecklist = new Checklist();
        List<ChecklistItem> items = new ArrayList<>();
        for (int i = 0; i < TOTAL_PONTOS_VERIFICACAO - 1; i++) {
             ChecklistItem item = new ChecklistItem();
             item.setStatusConformidade(new LookupValueData(STATUS_CONFORME_ID, null, null));
             items.add(item);
        }
        ChecklistItem nonConformeItem = new ChecklistItem();
        nonConformeItem.setStatusConformidade(new LookupValueData(STATUS_NAO_CONFORME_ID, null, null));
        items.add(nonConformeItem);
        existingChecklist.setItens(items);

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(existingChecklist));
        
        // Quando & Então
        assertThrows(ResponseStatusException.class, () -> checklistService.updateChecklist(checklistId, updateDto));
    }

        // --- Testes para o método deleteChecklist ---

    @Test
    void deleteChecklist_whenNotFinalized_shouldDeleteSuccessfully() {
        // GIVEN: Um checklist que ainda não foi finalizado (dataHoraTermino é nula).
        Long checklistId = 1L;
        Checklist checklist = new Checklist();
        checklist.setId(checklistId);
        checklist.setDataHoraTermino(null); // Em andamento

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));
        // doNothing() é usado para métodos void.
        doNothing().when(checklistRepository).deleteById(checklistId);

        // WHEN
        checklistService.deleteChecklist(checklistId);

        // THEN: Verifica se o método deleteById foi chamado exatamente uma vez.
        verify(checklistRepository, times(1)).deleteById(checklistId);
    }

    @Test
    void deleteChecklist_whenFinalized_shouldThrowException() {
        // GIVEN: Um checklist que já foi finalizado (possui dataHoraTermino).
        Long checklistId = 1L;
        Checklist checklist = new Checklist();
        checklist.setId(checklistId);
        checklist.setDataHoraTermino(LocalDateTime.now()); // Finalizado

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));

        // WHEN & THEN: Espera uma exceção de BAD_REQUEST com a mensagem correta.
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            checklistService.deleteChecklist(checklistId);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Checklists finalizados não podem ser excluídos"));
        
        // Garante que o método delete nunca foi chamado.
        verify(checklistRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteChecklist_whenChecklistNotFound_shouldThrowNotFoundException() {
        // GIVEN: Um ID que não existe.
        Long checklistId = 99L;
        when(checklistRepository.findById(checklistId)).thenReturn(Optional.empty());

        // WHEN & THEN: Espera uma exceção de NOT_FOUND.
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            checklistService.deleteChecklist(checklistId);
        });
        
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(checklistRepository, never()).deleteById(anyLong());
    }

        @Test
    void getChecklistsByDateRange_whenChecklistsExistInRange_shouldReturnList() {
        // GIVEN
        LocalDateTime startDate = LocalDateTime.of(2025, 6, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2025, 6, 30, 23, 59);
        Checklist checklist1 = new Checklist(); // Checklist de amostra
        
        when(checklistRepository.findByDataHoraInicioBetween(startDate, endDate))
            .thenReturn(Collections.singletonList(checklist1));

        // WHEN
        List<ChecklistResponseDto> result = checklistService.getChecklistsByDateRange(startDate, endDate);

        // THEN
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getChecklistsByDateRange_whenNoChecklistsInRange_shouldThrowNotFoundException() {
        // GIVEN
        LocalDateTime startDate = LocalDateTime.of(2025, 7, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2025, 7, 31, 23, 59);

        when(checklistRepository.findByDataHoraInicioBetween(startDate, endDate))
            .thenReturn(Collections.emptyList());

        // WHEN & THEN
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            checklistService.getChecklistsByDateRange(startDate, endDate);
        });
        
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        assertTrue(exception.getReason().contains("Nenhum checklist encontrado para o período especificado"));
    }

    // --- Testes para o método generateChecklistPdf ---

    @Test
    void generateChecklistPdf_whenAll18PointsArePresent_shouldReturnPdfBytes() throws Exception {
        // GIVEN: Um checklist com todos os 18 pontos preenchidos.
        Long checklistId = 1L;
        Checklist checklist = new Checklist();
        checklist.setId(checklistId);
        checklist.setTipoInspecaoModalidade(new LookupValueData(101, "TIPO_INSPECAO_MODALIDADE", "Rodoviário"));
        checklist.setOperacao(new LookupValueData(202, "OPERACAO", "Laranja"));
        checklist.setDataHoraInicio(LocalDateTime.now());

        // Assinaturas necessárias para o método addSignatureSection
        checklist.setAssinaturaMotorista("Motorista Teste");
        checklist.setAssinaturaRespDeslacrePosCarregamento("Responsável Deslacre");
        checklist.setAssinaturaRespInspecao("Responsável Inspeção");
        checklist.setAssinaturaRespLacre("Responsável Lacre");
        checklist.setNomeRespInspecao("João da Silva");

        List<ChecklistItem> items = new ArrayList<>();
        for (int i = 0; i < 18; i++) {
            ChecklistItem item = new ChecklistItem();
            item.setPontoVerificacao(new PontoVerificacao(i + 1, "Ponto " + (i + 1)));
            item.setStatusConformidade(new LookupValueData(401, "STATUS_CONFORMIDADE", "Conforme"));
            item.setObservacoes("Tudo certo.");
            items.add(item);
        }
        checklist.setItens(items);

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));
        when(pontoVerificacaoRepository.count()).thenReturn(18L);

        // WHEN
        byte[] pdfBytes = checklistService.generateChecklistPdf(checklistId);

        // THEN
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0, "O array de bytes do PDF não deveria estar vazio.");
    }

    @Test
    void generateChecklistPdf_whenNotAllPointsArePresent_shouldThrowException() {
        // GIVEN: Um checklist com menos de 18 itens.
        Long checklistId = 1L;
        Checklist checklist = new Checklist();
        checklist.setId(checklistId);
        checklist.setItens(Collections.singletonList(new ChecklistItem())); // Apenas 1 item

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));
        when(pontoVerificacaoRepository.count()).thenReturn(18L);

        // WHEN & THEN: Espera uma exceção de BAD_REQUEST.
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            checklistService.generateChecklistPdf(checklistId);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertTrue(exception.getReason().contains("só pode ser gerado se todos os 18 pontos de verificação estiverem preenchidos"));
    }

}
