package com.ezweb.service;

import com.ezweb.dto.*;
import com.ezweb.model.Category;
import com.ezweb.model.SubCategory;
import com.ezweb.model.Website;
import com.ezweb.repository.CategoryRepository;
import com.ezweb.repository.SubCategoryRepository;
import com.ezweb.repository.WebsiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final WebsiteRepository websiteRepository;

    // ==================== Category Operations ====================

    @Transactional
    public CategoryResponse createCategory(Long websiteId, CategoryRequest request) {
        log.info("Creating category for website: {}", websiteId);

        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found with id: " + websiteId));

        Category category = new Category();
        category.setWebsite(website);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(request.getActive() != null ? request.getActive() : true);

        Category saved = categoryRepository.save(category);
        log.info("Category created with id: {}", saved.getId());

        return mapToCategoryResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getWebsiteCategories(Long websiteId, Boolean activeOnly) {
        log.info("Fetching categories for website: {}, activeOnly: {}", websiteId, activeOnly);

        List<Category> categories;
        if (activeOnly != null && activeOnly) {
            categories = categoryRepository.findByWebsiteIdAndActiveTrue(websiteId);
        } else {
            categories = categoryRepository.findByWebsiteIdOrderByNameAsc(websiteId);
        }

        return categories.stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long categoryId) {
        log.info("Fetching category with id: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        return mapToCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long websiteId, Long categoryId, CategoryRequest request) {
        log.info("Updating category: {} for website: {}", categoryId, websiteId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        if (!category.getWebsite().getId().equals(websiteId)) {
            throw new RuntimeException("Category does not belong to the specified website");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updated = categoryRepository.save(category);
        log.info("Category updated: {}", categoryId);

        return mapToCategoryResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long websiteId, Long categoryId) {
        log.info("Deleting category: {} from website: {}", categoryId, websiteId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

        if (!category.getWebsite().getId().equals(websiteId)) {
            throw new RuntimeException("Category does not belong to the specified website");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", categoryId);
    }

    // ==================== Sub-Category Operations ====================

    @Transactional
    public SubCategoryResponse createSubCategory(Long websiteId, SubCategoryRequest request) {
        log.info("Creating sub-category for category: {}", request.getCategoryId());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        if (!category.getWebsite().getId().equals(websiteId)) {
            throw new RuntimeException("Category does not belong to the specified website");
        }

        SubCategory subCategory = new SubCategory();
        subCategory.setCategory(category);
        subCategory.setName(request.getName());
        subCategory.setDescription(request.getDescription());
        subCategory.setActive(request.getActive() != null ? request.getActive() : true);

        SubCategory saved = subCategoryRepository.save(subCategory);
        log.info("Sub-category created with id: {}", saved.getId());

        return mapToSubCategoryResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SubCategoryResponse> getCategorySubCategories(Long categoryId, Boolean activeOnly) {
        log.info("Fetching sub-categories for category: {}, activeOnly: {}", categoryId, activeOnly);

        List<SubCategory> subCategories;
        if (activeOnly != null && activeOnly) {
            subCategories = subCategoryRepository.findByCategoryIdAndActiveTrue(categoryId);
        } else {
            subCategories = subCategoryRepository.findByCategoryIdOrderByNameAsc(categoryId);
        }

        return subCategories.stream()
                .map(this::mapToSubCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubCategoryResponse getSubCategoryById(Long subCategoryId) {
        log.info("Fetching sub-category with id: {}", subCategoryId);

        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new RuntimeException("Sub-category not found with id: " + subCategoryId));

        return mapToSubCategoryResponse(subCategory);
    }

    @Transactional
    public SubCategoryResponse updateSubCategory(Long websiteId, Long subCategoryId, SubCategoryRequest request) {
        log.info("Updating sub-category: {}", subCategoryId);

        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new RuntimeException("Sub-category not found with id: " + subCategoryId));

        if (!subCategory.getCategory().getWebsite().getId().equals(websiteId)) {
            throw new RuntimeException("Sub-category does not belong to the specified website");
        }

        if (request.getCategoryId() != null && !request.getCategoryId().equals(subCategory.getCategory().getId())) {
            Category newCategory = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

            if (!newCategory.getWebsite().getId().equals(websiteId)) {
                throw new RuntimeException("New category does not belong to the specified website");
            }

            subCategory.setCategory(newCategory);
        }

        subCategory.setName(request.getName());
        subCategory.setDescription(request.getDescription());
        if (request.getActive() != null) {
            subCategory.setActive(request.getActive());
        }

        SubCategory updated = subCategoryRepository.save(subCategory);
        log.info("Sub-category updated: {}", subCategoryId);

        return mapToSubCategoryResponse(updated);
    }

    @Transactional
    public void deleteSubCategory(Long websiteId, Long subCategoryId) {
        log.info("Deleting sub-category: {}", subCategoryId);

        SubCategory subCategory = subCategoryRepository.findById(subCategoryId)
                .orElseThrow(() -> new RuntimeException("Sub-category not found with id: " + subCategoryId));

        if (!subCategory.getCategory().getWebsite().getId().equals(websiteId)) {
            throw new RuntimeException("Sub-category does not belong to the specified website");
        }

        subCategoryRepository.delete(subCategory);
        log.info("Sub-category deleted: {}", subCategoryId);
    }

    // ==================== Mapping Methods ====================

    private CategoryResponse mapToCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setWebsiteId(category.getWebsite().getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setActive(category.getActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());

        // Map sub-categories
        List<SubCategoryResponse> subCategories = category.getSubCategories().stream()
                .map(this::mapToSubCategoryResponse)
                .collect(Collectors.toList());
        response.setSubCategories(subCategories);

        return response;
    }

    private SubCategoryResponse mapToSubCategoryResponse(SubCategory subCategory) {
        SubCategoryResponse response = new SubCategoryResponse();
        response.setId(subCategory.getId());
        response.setCategoryId(subCategory.getCategory().getId());
        response.setCategoryName(subCategory.getCategory().getName());
        response.setName(subCategory.getName());
        response.setDescription(subCategory.getDescription());
        response.setActive(subCategory.getActive());
        response.setCreatedAt(subCategory.getCreatedAt());
        response.setUpdatedAt(subCategory.getUpdatedAt());

        return response;
    }
}
