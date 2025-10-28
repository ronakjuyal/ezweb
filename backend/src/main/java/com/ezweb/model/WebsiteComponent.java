package com.ezweb.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "website_components")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebsiteComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "website_id", nullable = false)
    private Website website;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_registry_id", nullable = false)
    private ComponentRegistry componentRegistry;

    @Column(name = "schema_data", columnDefinition = "TEXT", nullable = false)
    private String schemaData; // JSON data with customized values

    @Column(nullable = false)
    private Integer position = 0; // Order of component on page

    @Column(nullable = false)
    private Boolean visible = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
