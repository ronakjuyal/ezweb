package com.ezweb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ComponentRegistryRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "S3 File URL is required")
    private String s3FileUrl;

    @NotBlank(message = "Schema is required")
    private String schema; // JSON string

    private String category;

    private String version = "1.0.0";
}
