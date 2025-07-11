package com.uaga.checklist.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uaga.checklist.entity.ChecklistItem;

/**
 * Repositório para a entidade ChecklistItem.
 * Gerencia o acesso aos dados da tabela 'checklist_itens'.
 */
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    // Métodos para buscar itens por checklistId ou pontoVerificacaoId podem ser adicionados aqui
    List<ChecklistItem> findByChecklistId(Long checklistId);
}
