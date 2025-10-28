package com.ezweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComponentRegistryResponse {
    private Long id;
    private String name;
    private String description;
    private String s3FileUrl;
    private String schema;
    private String category;
    private String version;
    private Boolean active;
    private LocalDateTime createdAt;
}
