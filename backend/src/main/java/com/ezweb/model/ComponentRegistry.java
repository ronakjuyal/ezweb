package com.ezweb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "component_registry")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComponentRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "s3_file_url", nullable = false, length = 500)
    private String s3FileUrl;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String schema; // JSON schema stored as text

    @Column(length = 50)
    private String category;

    @Column(length = 20)
    private String version = "1.0.0";

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
