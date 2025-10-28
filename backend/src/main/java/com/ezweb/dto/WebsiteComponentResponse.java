package com.ezweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WebsiteComponentResponse {
    private Long id;
    private Long websiteId;
    private ComponentRegistryResponse componentRegistry;
    private String schemaData;
    private Integer position;
    private Boolean visible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
