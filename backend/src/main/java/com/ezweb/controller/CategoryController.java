package com.ezweb.controller;

import com.ezweb.dto.*;
import com.ezweb.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/websites/{websiteId}/categories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    // ==================== Category Endpoints ====================

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @PathVariable Long websiteId,
            @Valid @RequestBody CategoryRequest request) {
        log.info("POST /api/websites/{}/categories - Creating category: {}", websiteId, request.getName());

        CategoryResponse response = categoryService.createCategory(websiteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getWebsiteCategories(
            @PathVariable Long websiteId,
            @RequestParam(required = false) Boolean activeOnly) {
        log.info("GET /api/websites/{}/categories - activeOnly: {}", websiteId, activeOnly);

        List<CategoryResponse> categories = categoryService.getWebsiteCategories(websiteId, activeOnly);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Long websiteId,
            @PathVariable Long categoryId) {
        log.info("GET /api/websites/{}/categories/{}", websiteId, categoryId);

        CategoryResponse response = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long websiteId,
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request) {
        log.info("PUT /api/websites/{}/categories/{} - Updating category", websiteId, categoryId);

        CategoryResponse response = categoryService.updateCategory(websiteId, categoryId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long websiteId,
            @PathVariable Long categoryId) {
        log.info("DELETE /api/websites/{}/categories/{}", websiteId, categoryId);

        categoryService.deleteCategory(websiteId, categoryId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Sub-Category Endpoints ====================

    @PostMapping("/sub-categories")
    public ResponseEntity<SubCategoryResponse> createSubCategory(
            @PathVariable Long websiteId,
            @Valid @RequestBody SubCategoryRequest request) {
        log.info("POST /api/websites/{}/categories/sub-categories - Creating sub-category: {}",
                websiteId, request.getName());

        SubCategoryResponse response = categoryService.createSubCategory(websiteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{categoryId}/sub-categories")
    public ResponseEntity<List<SubCategoryResponse>> getCategorySubCategories(
            @PathVariable Long websiteId,
            @PathVariable Long categoryId,
            @RequestParam(required = false) Boolean activeOnly) {
        log.info("GET /api/websites/{}/categories/{}/sub-categories - activeOnly: {}",
                websiteId, categoryId, activeOnly);

        List<SubCategoryResponse> subCategories = categoryService.getCategorySubCategories(categoryId, activeOnly);
        return ResponseEntity.ok(subCategories);
    }

    @GetMapping("/sub-categories/{subCategoryId}")
    public ResponseEntity<SubCategoryResponse> getSubCategoryById(
            @PathVariable Long websiteId,
            @PathVariable Long subCategoryId) {
        log.info("GET /api/websites/{}/categories/sub-categories/{}", websiteId, subCategoryId);

        SubCategoryResponse response = categoryService.getSubCategoryById(subCategoryId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/sub-categories/{subCategoryId}")
    public ResponseEntity<SubCategoryResponse> updateSubCategory(
            @PathVariable Long websiteId,
            @PathVariable Long subCategoryId,
            @Valid @RequestBody SubCategoryRequest request) {
        log.info("PUT /api/websites/{}/categories/sub-categories/{} - Updating sub-category",
                websiteId, subCategoryId);

        SubCategoryResponse response = categoryService.updateSubCategory(websiteId, subCategoryId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sub-categories/{subCategoryId}")
    public ResponseEntity<Void> deleteSubCategory(
            @PathVariable Long websiteId,
            @PathVariable Long subCategoryId) {
        log.info("DELETE /api/websites/{}/categories/sub-categories/{}", websiteId, subCategoryId);

        categoryService.deleteSubCategory(websiteId, subCategoryId);
        return ResponseEntity.noContent().build();
    }
}
