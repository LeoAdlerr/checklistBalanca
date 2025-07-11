package com.uaga.checklist.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uaga.checklist.entity.LookupValueData;

/**
 * Repositório para a entidade LookupValueData.
 * Gerencia o acesso aos dados da tabela unificada de lookups.
 */
public interface LookupValueDataRepository extends JpaRepository<LookupValueData, Integer> {
    // JpaRepository<Entidade, TipoDaChavePrimaria>
    // Métodos para buscar lookups por tipo (category) ou descrição, se necessário.
    List<LookupValueData> findByType(String type);
    Optional<LookupValueData> findByTypeAndDescription(String type, String description);
}
