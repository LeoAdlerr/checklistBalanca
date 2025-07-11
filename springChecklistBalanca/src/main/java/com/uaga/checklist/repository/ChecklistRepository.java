package com.uaga.checklist.repository;

import com.uaga.checklist.entity.Checklist;
import org.springframework.data.jpa.repository.EntityGraph; // Importar EntityGraph
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Importar @Query
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositório para a entidade Checklist.
 * Gerencia o acesso aos dados da tabela 'checklists'.
 */
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    // Implementação de findAll customizada com JOIN FETCH para carregar todas as relações
    // Isso resolve o MultipleBagFetchException e LazyInitializationException em findAll()
    @Query("SELECT c FROM Checklist c " +
           "LEFT JOIN FETCH c.tipoInspecaoModalidade tim " +
           "LEFT JOIN FETCH c.operacao o " +
           "LEFT JOIN FETCH c.tipoUnidade tu " +
           "LEFT JOIN FETCH c.itens i " +
           "LEFT JOIN FETCH i.pontoVerificacao pv " +
           "LEFT JOIN FETCH i.statusConformidade sc " +
           "LEFT JOIN FETCH i.evidencias e " + // Fetch para a coleção de evidências
           "LEFT JOIN FETCH c.lacreSaida ls " +
           "LEFT JOIN FETCH ls.lacreRfb lrfb " +
           "LEFT JOIN FETCH ls.lacreArmadorPosUnitizacao lapu " +
           "LEFT JOIN FETCH ls.fitaLacreUagaCompartimento fluc " +
           "ORDER BY c.id ASC") // Adiciona uma ordenação para consultas com JOIN FETCH em listas
    List<Checklist> findAllWithDetails(); // NOVO método para getAllChecklists no serviço


    // O findById ainda usará o EntityGraph, pois ele lida melhor com uma única entidade
    @EntityGraph(attributePaths = {
        "tipoInspecaoModalidade",
        "operacao",
        "tipoUnidade",
        "itens",
        "lacreSaida",
        "itens.pontoVerificacao",
        "itens.statusConformidade",
        "itens.evidencias",
        "lacreSaida.lacreRfb",
        "lacreSaida.lacreArmadorPosUnitizacao",
        "lacreSaida.fitaLacreUagaCompartimento"
    })
    Optional<Checklist> findById(Long id);

    List<Checklist> findByDataHoraInicioBetween(LocalDateTime startDate, LocalDateTime endDate);
}
