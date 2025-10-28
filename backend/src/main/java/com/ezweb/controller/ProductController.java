package com.ezweb.controller;

import com.ezweb.dto.ApiResponse;
import com.ezweb.dto.ProductRequest;
import com.ezweb.dto.ProductResponse;
import com.ezweb.security.UserPrincipal;
import com.ezweb.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/websites/{websiteId}/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @PathVariable Long websiteId,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProductResponse response = productService.createProduct(websiteId, request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getWebsiteProducts(
            @PathVariable Long websiteId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ProductResponse> products = productService.getWebsiteProducts(websiteId, userPrincipal.getId());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/available")
    public ResponseEntity<List<ProductResponse>> getAvailableProducts(@PathVariable Long websiteId) {
        List<ProductResponse> products = productService.getAvailableProducts(websiteId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @PathVariable Long websiteId,
            @PathVariable String category) {
        List<ProductResponse> products = productService.getProductsByCategory(websiteId, category);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long websiteId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProductResponse product = productService.getProductById(id, userPrincipal.getId());
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long websiteId,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProductResponse product = productService.updateProduct(id, request, userPrincipal.getId());
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(
            @PathVariable Long websiteId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        productService.deleteProduct(id, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
    }
}
