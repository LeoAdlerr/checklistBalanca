package com.uaga.checklist.service;

import com.itextpdf.io.exceptions.IOException;
import com.uaga.checklist.dto.CreateChecklistDto;
import com.uaga.checklist.dto.UpdateChecklistDto;
import com.uaga.checklist.dto.response.ChecklistResponseDto;
import org.springframework.web.server.ResponseStatusException; // Import the exception

import java.time.LocalDateTime;
import java.util.List;

/**
 * Interface for the Checklist Service.
 * Defines the contract for business operations related to Checklists.
 */
public interface ChecklistService {
    /**
     * Creates a new complete Checklist.
     * @param createChecklistDto DTO containing data for the new Checklist.
     * @return The created Checklist as a response DTO.
     */
    ChecklistResponseDto createChecklist(CreateChecklistDto createChecklistDto);

    /**
     * Retrieves all Checklists.
     * @return A list of Checklist response DTOs.
     */
    List<ChecklistResponseDto> getAllChecklists();

    /**
     * Retrieves a specific Checklist by its ID.
     * @param id The ID of the Checklist to retrieve.
     * @return The Checklist as a response DTO.
     * @throws ResponseStatusException with HttpStatus.NOT_FOUND if the Checklist is not found.
     */
    ChecklistResponseDto getChecklistById(Long id) throws ResponseStatusException;

    /**
     * Updates an existing Checklist.
     * @param id The ID of the Checklist to update.
     * @param updateChecklistDto DTO containing partial data for the update.
     * @return The updated Checklist as a response DTO.
     * @throws ResponseStatusException with HttpStatus.NOT_FOUND if the Checklist is not found.
     */
    ChecklistResponseDto updateChecklist(Long id, UpdateChecklistDto updateChecklistDto) throws ResponseStatusException;

    /**
     * Deletes a Checklist by its ID.
     * @param id The ID of the Checklist to delete.
     * @throws ResponseStatusException with HttpStatus.NOT_FOUND if the Checklist is not found.
     */
    void deleteChecklist(Long id) throws ResponseStatusException;

    /**
     * Recupera checklists dentro de um intervalo de datas de início.
     * @param startDate A data de início da busca.
     * @param endDate A data de término da busca.
     * @return Uma lista de checklists encontrados.
     * @throws ResponseStatusException com HttpStatus.NOT_FOUND se nenhum for encontrado.
     */
    List<ChecklistResponseDto> getChecklistsByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Gera um relatório em PDF para um checklist específico.
     * @param id O ID do checklist a ser exportado.
     * @return Um array de bytes representando o arquivo PDF.
     * @throws ResponseStatusException se o checklist não for encontrado ou não cumprir os requisitos para exportação.
     * @throws IOException se ocorrer um erro durante a criação do PDF.
     * @throws java.io.IOException 
     */
    byte[] generateChecklistPdf(Long id) throws IOException, java.io.IOException;
}
