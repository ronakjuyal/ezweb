package com.ezweb.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubCategoryResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
