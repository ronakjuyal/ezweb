package com.ezweb.service;

import com.ezweb.dto.ProductRequest;
import com.ezweb.dto.ProductResponse;
import com.ezweb.model.Product;
import com.ezweb.model.Website;
import com.ezweb.model.Category;
import com.ezweb.model.SubCategory;
import com.ezweb.repository.ProductRepository;
import com.ezweb.repository.WebsiteRepository;
import com.ezweb.repository.CategoryRepository;
import com.ezweb.repository.SubCategoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final WebsiteRepository websiteRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final S3Service s3Service;
    private final ModelMapper modelMapper = new ModelMapper();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ProductResponse createProduct(Long websiteId, ProductRequest request, Long userId) {
        // Get website and verify ownership
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        Product product = new Product();
        product.setWebsite(website);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());

        // Convert imageUrls list to JSON string
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            try {
                product.setImageUrls(objectMapper.writeValueAsString(request.getImageUrls()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize image URLs", e);
            }
        }

        product.setStock(request.getStock());
        product.setAvailable(request.getAvailable());
        product.setCategory(request.getCategory());
        product.setSku(request.getSku());

        // Set category relationships
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategoryObj(category);
        }
        if (request.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new RuntimeException("Sub-category not found with id: " + request.getSubCategoryId()));
            product.setSubCategory(subCategory);
        }

        Product savedProduct = productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getWebsiteProducts(Long websiteId, Long userId) {
        // Verify website exists and user owns it
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        List<Product> products = productRepository.findByWebsiteId(websiteId);
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProducts(Long websiteId) {
        List<Product> products = productRepository.findByWebsiteIdAndAvailableTrue(websiteId);
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long websiteId, String category) {
        List<Product> products = productRepository.findByWebsiteIdAndCategory(websiteId, category);
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to product");
        }

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());

        // Convert imageUrls list to JSON string
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            try {
                product.setImageUrls(objectMapper.writeValueAsString(request.getImageUrls()));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize image URLs", e);
            }
        }

        product.setStock(request.getStock());
        product.setAvailable(request.getAvailable());
        product.setCategory(request.getCategory());
        product.setSku(request.getSku());

        // Update category relationships
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategoryObj(category);
        } else {
            product.setCategoryObj(null);
        }

        if (request.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new RuntimeException("Sub-category not found with id: " + request.getSubCategoryId()));
            product.setSubCategory(subCategory);
        } else {
            product.setSubCategory(null);
        }

        Product updatedProduct = productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to product");
        }

        // Delete images from S3
        // Delete single image if exists
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                String key = extractKeyFromUrl(product.getImageUrl());
                s3Service.deleteFile(key);
                log.info("Deleted single product image from S3: {}", key);
            } catch (Exception e) {
                log.error("Failed to delete single product image from S3: {}", e.getMessage());
            }
        }

        // Delete multiple images if exists
        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            try {
                List<String> imageUrls = objectMapper.readValue(
                    product.getImageUrls(),
                    new TypeReference<List<String>>() {}
                );
                for (String imageUrl : imageUrls) {
                    try {
                        String key = extractKeyFromUrl(imageUrl);
                        s3Service.deleteFile(key);
                        log.info("Deleted product image from S3: {}", key);
                    } catch (Exception e) {
                        log.error("Failed to delete product image from S3: {}", e.getMessage());
                    }
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to parse imageUrls JSON: {}", e.getMessage());
            }
        }

        productRepository.delete(product);
    }

    private String extractKeyFromUrl(String s3Url) {
        // Extract the key from S3 URL
        // URL format: https://bucket-name.s3.region.amazonaws.com/key
        // or: https://s3.region.amazonaws.com/bucket-name/key
        try {
            String[] parts = s3Url.split(".amazonaws.com/");
            if (parts.length > 1) {
                return parts[1];
            }
            throw new RuntimeException("Invalid S3 URL format");
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract key from S3 URL: " + s3Url, e);
        }
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = modelMapper.map(product, ProductResponse.class);
        response.setWebsiteId(product.getWebsite().getId());

        // Deserialize imageUrls JSON string to list
        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            try {
                List<String> imageUrls = objectMapper.readValue(
                    product.getImageUrls(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
                );
                response.setImageUrls(imageUrls);
            } catch (JsonProcessingException e) {
                // If deserialization fails, set empty list
                response.setImageUrls(List.of());
            }
        }

        // Map category and sub-category IDs
        if (product.getCategoryObj() != null) {
            response.setCategoryId(product.getCategoryObj().getId());
        }
        if (product.getSubCategory() != null) {
            response.setSubCategoryId(product.getSubCategory().getId());
        }

        return response;
    }
}
