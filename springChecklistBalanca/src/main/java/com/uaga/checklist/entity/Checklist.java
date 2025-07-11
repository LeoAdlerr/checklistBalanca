package com.uaga.checklist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime; // Para DATETIME
import java.util.List;

@Entity
@Table(name = "checklists") // Nome da tabela no BD
@Data
@NoArgsConstructor
@AllArgsConstructor // Para facilitar a criação de mocks ou instâncias em testes
public class Checklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // BIGINT AUTO_INCREMENT
    private Long id; // Long para BIGINT

    @Column(name = "data_hora_inicio", nullable = false)
    private LocalDateTime dataHoraInicio; // Para DATETIME

    @Column(name = "data_hora_termino", nullable = true)
    private LocalDateTime dataHoraTermino; // Para DATETIME, pode ser nulo

    @Column(name = "n_lacre_uaga_pos_inspecao", length = 255)
    private String nLacreUagaPosInspecao;

    @Column(name = "n_lacre_uaga_pos_carregamento", length = 255)
    private String nLacreUagaPosCarregamento;

    @Column(name = "nome_resp_lacre", length = 255)
    private String nomeRespLacre;

    @Column(name = "assinatura_resp_lacre", columnDefinition = "TEXT") // TEXT
    private String assinaturaRespLacre;

    @Column(name = "nome_resp_deslacre_pos_carregamento", length = 255)
    private String nomeRespDeslacrePosCarregamento;

    @Column(name = "assinatura_resp_deslacre_pos_carregamento", columnDefinition = "TEXT") // TEXT
    private String assinaturaRespDeslacrePosCarregamento;

    @Column(name = "n_lacre_armador", length = 255)
    private String nLacreArmador;

    @Column(name = "n_lacre_rfb", length = 255)
    private String nLacreRfb;

    @Column(name = "observacoes_gerais", columnDefinition = "TEXT") // TEXT
    private String observacoesGerais;

    @Column(name = "providencias_tomadas", columnDefinition = "TEXT") // TEXT
    private String providenciasTomadas;

    @Column(name = "nome_resp_inspecao", nullable = false, length = 255)
    private String nomeRespInspecao;

    @Column(name = "assinatura_resp_inspecao", nullable = false, columnDefinition = "TEXT") // TEXT
    private String assinaturaRespInspecao;

    @Column(name = "assinatura_motorista", columnDefinition = "TEXT") // TEXT
    private String assinaturaMotorista;

    // Relações ManyToOne para a ÚNICA tabela de Lookup (FKs) - FetchType EAGER para evitar LazyInitializationException
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_inspecao_modalidade_id", nullable = false)
    @ToString.Exclude
    private LookupValueData tipoInspecaoModalidade;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operacao_id", nullable = false)
    @ToString.Exclude
    private LookupValueData operacao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_unidade_id", nullable = false)
    @ToString.Exclude
    private LookupValueData tipoUnidade;

    // Relações OneToMany e OneToOne para tabelas filhas - Manter LAZY
    // O carregamento será feito via JOIN FETCH explícito em Repository ou Hibernate.initialize()
    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ChecklistItem> itens;

    @OneToOne(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private LacreSaida lacreSaida;
}
