package com.ezweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WebsiteResponse {
    private Long id;
    private String subdomain;
    private String title;
    private String description;
    private Boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
