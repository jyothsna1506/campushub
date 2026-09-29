package com.campushub.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "colleges")
@Getter
@Setter
@NoArgsConstructor
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public College(String name, String code, String description) {
        this.name = name;
        this.code = code != null ? code.trim().toUpperCase() : null;
        this.description = description;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }
}
