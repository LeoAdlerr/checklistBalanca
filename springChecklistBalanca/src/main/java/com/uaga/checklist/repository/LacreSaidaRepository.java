package com.uaga.checklist.repository;

import com.uaga.checklist.entity.LacreSaida;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade LacreSaida.
 * Gerencia o acesso aos dados da tabela 'lacres_saida'.
 */
public interface LacreSaidaRepository extends JpaRepository<LacreSaida, Long> {
    // Métodos personalizados, se necessário
    Optional<LacreSaida> findByChecklistId(Long checklistId);
}
