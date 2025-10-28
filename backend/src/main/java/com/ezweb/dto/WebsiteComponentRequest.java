package com.ezweb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WebsiteComponentRequest {

    @NotNull(message = "Component Registry ID is required")
    private Long componentRegistryId;

    @NotBlank(message = "Schema data is required")
    private String schemaData; // JSON with customized values

    private Integer position = 0;

    private Boolean visible = true;
}
