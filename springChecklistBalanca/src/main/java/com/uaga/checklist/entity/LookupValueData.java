package com.uaga.checklist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor; // Importar
import lombok.Data;
import lombok.NoArgsConstructor; // Importar

@Entity
@Table(name = "lookup_value_data") // Nome exato da nova tabela única de lookup
@Data
@NoArgsConstructor
@AllArgsConstructor // Para facilitar a criação de mocks ou instâncias em testes
public class LookupValueData {
    @Id
    // Sem @GeneratedValue, pois os IDs são gerenciados manualmente no DDL (init.sql)
    private Integer id;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // Ex: 'MODALIDADE', 'OPERACAO', 'STATUS_CONFORMIDADE'

    @Column(name = "description", nullable = false, length = 255)
    private String description;
}
