package com.uaga.checklist.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pontos_verificacao")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PontoVerificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // IDENTITY para AUTO_INCREMENT no MySQL
    private Integer id;

    @Column(name = "descricao", nullable = false, unique = true, length = 255)
    private String descricao;
}
