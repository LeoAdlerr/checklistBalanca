package com.uaga.checklist.repository;

import com.uaga.checklist.entity.Evidencia;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade Evidencia.
 * Gerencia o acesso aos dados da tabela 'evidencias'.
 */
public interface EvidenciaRepository extends JpaRepository<Evidencia, Long> {
    // Métodos personalizados, se necessário
    List<Evidencia> findByChecklistItemId(Long checklistItemId);
}
