package com.ezweb.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponse {
    private Long id;
    private Long websiteId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private List<String> imageUrls;  // Multiple product images
    private Integer stock;
    private Boolean available;
    private String category;
    private String sku;
    private Long categoryId;
    private Long subCategoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
