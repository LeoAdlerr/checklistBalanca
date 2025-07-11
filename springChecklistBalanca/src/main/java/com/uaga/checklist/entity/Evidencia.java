package com.uaga.checklist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "evidencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // BIGINT

    @Column(name = "checklist_item_id", nullable = false, insertable = false, updatable = false)
    private Long checklistItemId;

    @Column(name = "url_imagem", nullable = false, length = 255)
    private String urlImagem;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    // Relação ManyToOne com ChecklistItem
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_item_id", nullable = false)
    @ToString.Exclude
    private ChecklistItem checklistItem;
}
