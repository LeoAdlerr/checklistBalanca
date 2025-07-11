package com.uaga.checklist.service.impl;

// IText imports
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

// DTOs and Entities
import com.uaga.checklist.dto.ChecklistItemDto;
import com.uaga.checklist.dto.CreateChecklistDto;
import com.uaga.checklist.dto.LacreSaidaDto;
import com.uaga.checklist.dto.UpdateChecklistDto;
import com.uaga.checklist.dto.response.*;
import com.uaga.checklist.entity.*;
import com.uaga.checklist.repository.*;
import com.uaga.checklist.service.ChecklistService;

// Spring and Hibernate
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

// Java Standard Library
import java.io.ByteArrayOutputStream;
import java.io.IOException; // Usando a exceção padrão do Java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChecklistServiceImpl implements ChecklistService {

    private static final int STATUS_NAO_CONFORME_ID = 402;

    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final LacreSaidaRepository lacreSaidaRepository;
    private final PontoVerificacaoRepository pontoVerificacaoRepository;
    private final LookupValueDataRepository lookupValueDataRepository;

    @Autowired
    public ChecklistServiceImpl(ChecklistRepository checklistRepository,
                                  ChecklistItemRepository checklistItemRepository,
                                  EvidenciaRepository evidenciaRepository,
                                  LacreSaidaRepository lacreSaidaRepository,
                                  PontoVerificacaoRepository pontoVerificacaoRepository,
                                  LookupValueDataRepository lookupValueDataRepository) {
        this.checklistRepository = checklistRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.evidenciaRepository = evidenciaRepository;
        this.lacreSaidaRepository = lacreSaidaRepository;
        this.pontoVerificacaoRepository = pontoVerificacaoRepository;
        this.lookupValueDataRepository = lookupValueDataRepository;
    }
    
    @Override
    @Transactional
    public ChecklistResponseDto createChecklist(CreateChecklistDto createChecklistDto) {
        Checklist checklist = new Checklist();
        mapCreateDtoToEntity(createChecklistDto, checklist);
        Checklist savedChecklist = checklistRepository.save(checklist);

        if (createChecklistDto.getItens() != null && !createChecklistDto.getItens().isEmpty()) {
            List<ChecklistItem> checklistItems = createChecklistDto.getItens().stream()
                .map(itemDto -> createAndSaveNewItem(savedChecklist, itemDto))
                .collect(Collectors.toList());
            savedChecklist.setItens(checklistItems);
        }

        if (createChecklistDto.getLacresSaida() != null) {
            LacreSaida lacreSaida = new LacreSaida();
            lacreSaida.setChecklist(savedChecklist);
            
            LacreSaidaDto lacreDto = createChecklistDto.getLacresSaida();
            lacreSaida.setNomeRespVerificacao(lacreDto.getNomeRespVerificacao());
            lacreSaida.setAssinaturaRespVerificacao(lacreDto.getAssinaturaRespVerificacao());
            lacreSaida.setDataSaida(lacreDto.getDataSaida());
            
            lacreSaida.setLacreRfb(lookupValueDataRepository.findById(lacreDto.getLacreRfbId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lacre RFB inválido")));
            lacreSaida.setLacreArmadorPosUnitizacao(lookupValueDataRepository.findById(lacreDto.getLacreArmadorPosUnitizacaoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lacre Armador inválido")));
            lacreSaida.setFitaLacreUagaCompartimento(lookupValueDataRepository.findById(lacreDto.getFitaLacreUagaCompartimentoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fita Lacre inválida")));
            
            lacreSaidaRepository.save(lacreSaida);
            savedChecklist.setLacreSaida(lacreSaida);
        }

        return mapChecklistToResponseDto(savedChecklist);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ChecklistResponseDto> getAllChecklists() {
        return checklistRepository.findAll().stream()
                .map(this::mapChecklistToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChecklistResponseDto getChecklistById(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist não encontrado com o ID: " + id));
        return mapChecklistToResponseDto(checklist);
    }

    @Override
    @Transactional
    public ChecklistResponseDto updateChecklist(Long id, UpdateChecklistDto updateChecklistDto) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist não encontrado com o ID: " + id));

        if (updateChecklistDto.getItens() != null) {
            updateChecklistItems(updateChecklistDto.getItens(), checklist);
        }

        Optional.ofNullable(updateChecklistDto.getObservacoesGerais()).ifPresent(checklist::setObservacoesGerais);
        Optional.ofNullable(updateChecklistDto.getProvidenciasTomadas()).ifPresent(checklist::setProvidenciasTomadas);

        if (updateChecklistDto.getDataHoraTermino() != null) {
            validateChecklistForFinalization(checklist);
            checklist.setDataHoraTermino(updateChecklistDto.getDataHoraTermino());
        }

        return mapChecklistToResponseDto(checklistRepository.save(checklist));
    }
    
    @Override
    @Transactional
    public void deleteChecklist(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist not found with ID: " + id));

        if (checklist.getDataHoraTermino() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checklists finalizados não podem ser excluídos.");
        }

        checklistRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChecklistResponseDto> getChecklistsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<Checklist> checklists = checklistRepository.findByDataHoraInicioBetween(startDate, endDate);

        if (checklists.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum checklist encontrado para o período especificado.");
        }

        return checklists.stream()
                .map(this::mapChecklistToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateChecklistPdf(Long id) throws IOException {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist not found with ID: " + id));

        long totalPontosDefinidos = pontoVerificacaoRepository.count();
        if (checklist.getItens().size() < totalPontosDefinidos) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O PDF só pode ser gerado se todos os " + totalPontosDefinidos + " pontos de verificação estiverem preenchidos.");
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        document.setMargins(36, 36, 36, 36);

        addPdfHeader(document, checklist);
        addItemsTable(document, checklist.getItens());
        addSignatureSection(document, checklist);

        document.close();
        return baos.toByteArray();
    }

    // --- Métodos Privados Auxiliares ---
    
    private void addPdfHeader(Document document, Checklist checklist) {
        document.add(new Paragraph("Relatório de Checklist de Inspeção").setTextAlignment(TextAlignment.CENTER).setBold().setFontSize(18).setMarginBottom(20));
        document.add(new Paragraph("Checklist ID: " + checklist.getId()));
        document.add(new Paragraph("Data de Início: " + checklist.getDataHoraInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
        if(checklist.getDataHoraTermino() != null) {
            document.add(new Paragraph("Data de Término: " + checklist.getDataHoraTermino().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))));
        }
        document.add(new Paragraph("Tipo de Inspeção: " + checklist.getTipoInspecaoModalidade().getDescription()));
        document.add(new Paragraph("Operação: " + checklist.getOperacao().getDescription()).setMarginBottom(15));
    }

    private void addItemsTable(Document document, List<ChecklistItem> items) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 5, 2, 5})).useAllAvailableWidth();
        table.setMarginTop(15);
        table.addHeaderCell(new Cell().add(new Paragraph("ID").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Ponto de Verificação").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Status").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Observações").setBold()));
        for (ChecklistItem item : items) {
            table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getPontoVerificacao().getId()))));
            table.addCell(new Cell().add(new Paragraph(item.getPontoVerificacao().getDescricao())));
            Paragraph statusParagraph = new Paragraph(item.getStatusConformidade().getDescription());
            if ("Não Conforme".equals(item.getStatusConformidade().getDescription())) {
                statusParagraph.setFontColor(ColorConstants.RED);
            }
            table.addCell(new Cell().add(statusParagraph));
            table.addCell(new Cell().add(new Paragraph(item.getObservacoes() != null ? item.getObservacoes() : "")));
        }
        document.add(table);
    }

    private void addSignatureSection(Document document, Checklist checklist) {
        document.add(new Paragraph("\n\n\n"));
        document.add(new Paragraph("_________________________________________").setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph(checklist.getNomeRespInspecao()).setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Assinatura do Responsável pela Inspeção").setTextAlignment(TextAlignment.CENTER).setFontSize(10));
    }
    
    private void updateChecklistItems(List<ChecklistItemDto> itemDtos, Checklist checklist) {
        for (ChecklistItemDto itemDto : itemDtos) {
            Optional<ChecklistItem> existingItemOpt = checklist.getItens().stream()
                    .filter(i -> i.getPontoVerificacao() != null && i.getPontoVerificacao().getId().equals(itemDto.getPontoVerificacaoId()))
                    .findFirst();

            if (existingItemOpt.isPresent()) {
                updateExistingItem(existingItemOpt.get(), itemDto);
            } else {
                ChecklistItem newItem = createAndSaveNewItem(checklist, itemDto);
                checklist.getItens().add(newItem);
            }
        }
    }

    private void validateChecklistForFinalization(Checklist checklist) {
        long totalPontosDefinidos = pontoVerificacaoRepository.count();
        if (checklist.getItens().size() < totalPontosDefinidos) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível finalizar: Todos os " + totalPontosDefinidos + " pontos de verificação devem ser preenchidos.");
        }
        boolean hasNonConformeItem = checklist.getItens().stream()
                .anyMatch(item -> item.getStatusConformidade().getId() == STATUS_NAO_CONFORME_ID);
        if (hasNonConformeItem) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível finalizar: Todos os itens devem estar 'Conforme' ou 'N/A'.");
        }
    }

    private void updateExistingItem(ChecklistItem existingItem, ChecklistItemDto itemDto) {
        existingItem.setObservacoes(itemDto.getObservacoes());
        LookupValueData status = lookupValueDataRepository.findById(itemDto.getStatusConformidadeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de conformidade inválido: " + itemDto.getStatusConformidadeId()));
        existingItem.setStatusConformidade(status);
    }

    private ChecklistItem createAndSaveNewItem(Checklist checklist, ChecklistItemDto itemDto) {
        ChecklistItem newItem = new ChecklistItem();
        newItem.setChecklist(checklist);
        newItem.setObservacoes(itemDto.getObservacoes());
        PontoVerificacao ponto = pontoVerificacaoRepository.findById(itemDto.getPontoVerificacaoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ponto de verificação inválido: " + itemDto.getPontoVerificacaoId()));
        newItem.setPontoVerificacao(ponto);
        LookupValueData status = lookupValueDataRepository.findById(itemDto.getStatusConformidadeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de conformidade inválido: " + itemDto.getStatusConformidadeId()));
        newItem.setStatusConformidade(status);
        
        ChecklistItem savedItem = checklistItemRepository.save(newItem);

        if (itemDto.getEvidencias() != null && !itemDto.getEvidencias().isEmpty()) {
            List<Evidencia> evidences = itemDto.getEvidencias().stream().map(evidenciaDto -> {
                Evidencia evidencia = new Evidencia();
                evidencia.setChecklistItem(savedItem);
                evidencia.setUrlImagem(evidenciaDto.getUrlImagem());
                evidencia.setDescricao(evidenciaDto.getDescricao());
                return evidencia;
            }).collect(Collectors.toList());
            evidenciaRepository.saveAll(evidences);
            savedItem.setEvidencias(evidences);
        }
        return savedItem;
    }
    
    private void mapCreateDtoToEntity(CreateChecklistDto dto, Checklist entity) {
        entity.setDataHoraInicio(dto.getDataHoraInicio());
        entity.setDataHoraTermino(dto.getDataHoraTermino());
        entity.setNLacreUagaPosInspecao(dto.getNLacreUagaPosInspecao());
        entity.setNLacreUagaPosCarregamento(dto.getNLacreUagaPosCarregamento());
        entity.setNomeRespLacre(dto.getNomeRespLacre());
        entity.setAssinaturaRespLacre(dto.getAssinaturaRespLacre());
        entity.setNomeRespDeslacrePosCarregamento(dto.getNomeRespDeslacrePosCarregamento());
        entity.setAssinaturaRespDeslacrePosCarregamento(dto.getAssinaturaRespDeslacrePosCarregamento());
        entity.setNLacreArmador(dto.getNLacreArmador());
        entity.setNLacreRfb(dto.getNLacreRfb());
        entity.setObservacoesGerais(dto.getObservacoesGerais());
        entity.setProvidenciasTomadas(dto.getProvidenciasTomadas());
        entity.setNomeRespInspecao(dto.getNomeRespInspecao());
        entity.setAssinaturaRespInspecao(dto.getAssinaturaRespInspecao());
        entity.setAssinaturaMotorista(dto.getAssinaturaMotorista());

        entity.setTipoInspecaoModalidade(lookupValueDataRepository.findById(dto.getTipoInspecaoModalidadeId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de Inspeção inválido: " + dto.getTipoInspecaoModalidadeId())));
        entity.setOperacao(lookupValueDataRepository.findById(dto.getOperacaoId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Operação inválida: " + dto.getOperacaoId())));
        entity.setTipoUnidade(lookupValueDataRepository.findById(dto.getTipoUnidadeId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de Unidade inválido: " + dto.getTipoUnidadeId())));
    }

    private ChecklistResponseDto mapChecklistToResponseDto(Checklist checklist) {
        if (checklist == null) return null;
        ChecklistResponseDto dto = new ChecklistResponseDto();
        dto.setId(checklist.getId());
        dto.setDataHoraInicio(checklist.getDataHoraInicio());
        dto.setDataHoraTermino(checklist.getDataHoraTermino());
        dto.setObservacoesGerais(checklist.getObservacoesGerais());
        dto.setNomeRespInspecao(checklist.getNomeRespInspecao());

        if (checklist.getTipoInspecaoModalidade() != null) {
            dto.setTipoInspecaoModalidade(new LookupValueDataResponseDto(checklist.getTipoInspecaoModalidade().getId(), checklist.getTipoInspecaoModalidade().getType(), checklist.getTipoInspecaoModalidade().getDescription()));
        }
        if (checklist.getOperacao() != null) {
            dto.setOperacao(new LookupValueDataResponseDto(checklist.getOperacao().getId(), checklist.getOperacao().getType(), checklist.getOperacao().getDescription()));
        }
        if (checklist.getTipoUnidade() != null) {
            dto.setTipoUnidade(new LookupValueDataResponseDto(checklist.getTipoUnidade().getId(), checklist.getTipoUnidade().getType(), checklist.getTipoUnidade().getDescription()));
        }

        if (checklist.getItens() != null) {
            Hibernate.initialize(checklist.getItens());
            dto.setItens(checklist.getItens().stream().map(this::mapItemToDto).collect(Collectors.toList()));
        }
        
        return dto;
    }

    private ChecklistItemResponseDto mapItemToDto(ChecklistItem item) {
        if (item == null) return null;
        ChecklistItemResponseDto itemDto = new ChecklistItemResponseDto();
        itemDto.setId(item.getId());
        itemDto.setObservacoes(item.getObservacoes());
        if(item.getPontoVerificacao() != null) {
            itemDto.setPontoVerificacao(new PontoVerificacaoResponseDto(item.getPontoVerificacao().getId(), item.getPontoVerificacao().getDescricao()));
        }
        if(item.getStatusConformidade() != null) {
            itemDto.setStatusConformidade(new LookupValueDataResponseDto(item.getStatusConformidade().getId(), item.getStatusConformidade().getType(), item.getStatusConformidade().getDescription()));
        }
        if (item.getEvidencias() != null) {
            Hibernate.initialize(item.getEvidencias());
            itemDto.setEvidencias(item.getEvidencias().stream()
                    .map(ev -> new EvidenciaResponseDto(ev.getId(), ev.getUrlImagem(), ev.getDescricao()))
                    .collect(Collectors.toList()));
        }
        return itemDto;
    }
}