package com.uaga.checklist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@Table(name = "checklist_itens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // BIGINT

    @Column(name = "checklist_id", nullable = false, insertable = false, updatable = false)
    private Long checklistId;

    @Column(name = "ponto_verificacao_id", nullable = false, insertable = false, updatable = false)
    private Integer pontoVerificacaoId;

    @Column(name = "status_conformidade_id", nullable = false, insertable = false, updatable = false)
    private Integer statusConformidadeId;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // Relação ManyToOne para Checklist (pai)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    @ToString.Exclude
    private Checklist checklist;

    // Relação ManyToOne para PontoVerificacao
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ponto_verificacao_id", nullable = false)
    @ToString.Exclude
    private PontoVerificacao pontoVerificacao;

    // Relação ManyToOne para a ÚNICA tabela de Lookup (Status de Conformidade)
    @ManyToOne(fetch = FetchType.LAZY) // Manter LAZY para evitar MultipleBagFetchException em fetches complexos
    @JoinColumn(name = "status_conformidade_id", nullable = false)
    @ToString.Exclude
    private LookupValueData statusConformidade;

    // Relação OneToMany com Evidencia
    @OneToMany(mappedBy = "checklistItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) // Manter LAZY
    @ToString.Exclude
    private List<Evidencia> evidencias;
}
