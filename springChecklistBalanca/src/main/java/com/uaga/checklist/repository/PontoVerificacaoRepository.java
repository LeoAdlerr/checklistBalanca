package com.uaga.checklist.repository;

import com.uaga.checklist.entity.PontoVerificacao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório para a entidade PontoVerificacao.
 * Gerencia o acesso aos dados da tabela 'pontos_verificacao'.
 */
public interface PontoVerificacaoRepository extends JpaRepository<PontoVerificacao, Integer> {
    // Métodos personalizados, se necessário
    Optional<PontoVerificacao> findByDescricao(String descricao);
}