package com.uaga.checklist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

@Entity
@Table(name = "lacres_saida")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LacreSaida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- CORREÇÃO: Adicionado insertable=false, updatable=false ---
    @Column(name = "checklist_id", nullable = false, unique = true, insertable = false, updatable = false)
    private Long checklistId;

    // --- CORREÇÃO: Adicionado insertable=false, updatable=false ---
    @Column(name = "lacre_rfb_id", nullable = false, insertable = false, updatable = false)
    private Integer lacreRfbId;

    // --- CORREÇÃO: Adicionado insertable=false, updatable=false ---
    @Column(name = "lacre_armador_pos_unitizacao_id", nullable = false, insertable = false, updatable = false)
    private Integer lacreArmadorPosUnitizacaoId;

    // --- CORREÇÃO: Adicionado insertable=false, updatable=false ---
    @Column(name = "fita_lacre_uaga_compartimento_id", nullable = false, insertable = false, updatable = false)
    private Integer fitaLacreUagaCompartimentoId;

    @Column(name = "nome_resp_verificacao", nullable = false, length = 255)
    private String nomeRespVerificacao;

    @Column(name = "assinatura_resp_verificacao", nullable = false, columnDefinition = "TEXT")
    private String assinaturaRespVerificacao;

    @Column(name = "data_saida", nullable = false)
    private LocalDate dataSaida;

    // Relação OneToOne com Checklist (pai)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false, unique = true)
    @ToString.Exclude
    private Checklist checklist;

    // Relações ManyToOne para a ÚNICA tabela de Lookup (status dos lacres)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lacre_rfb_id") // 'nullable' já está definido pelo atributo de ID
    @ToString.Exclude
    private LookupValueData lacreRfb;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lacre_armador_pos_unitizacao_id")
    @ToString.Exclude
    private LookupValueData lacreArmadorPosUnitizacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fita_lacre_uaga_compartimento_id")
    @ToString.Exclude
    private LookupValueData fitaLacreUagaCompartimento;
}
