package com.ezweb.controller;

import com.ezweb.dto.ApiResponse;
import com.ezweb.dto.ProductResponse;
import com.ezweb.dto.WebsiteRequest;
import com.ezweb.dto.WebsiteResponse;
import com.ezweb.security.UserPrincipal;
import com.ezweb.service.ProductService;
import com.ezweb.service.WebsiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/websites")
@RequiredArgsConstructor
public class WebsiteController {

    private final WebsiteService websiteService;
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<WebsiteResponse> createWebsite(
            @Valid @RequestBody WebsiteRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WebsiteResponse response = websiteService.createWebsite(request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WebsiteResponse>> getUserWebsites(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WebsiteResponse> websites = websiteService.getUserWebsites(userPrincipal.getId());
        return ResponseEntity.ok(websites);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebsiteResponse> getWebsiteById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WebsiteResponse website = websiteService.getWebsiteById(id, userPrincipal.getId());
        return ResponseEntity.ok(website);
    }

    @GetMapping("/subdomain/{subdomain}")
    public ResponseEntity<WebsiteResponse> getWebsiteBySubdomain(@PathVariable String subdomain) {
        WebsiteResponse website = websiteService.getWebsiteBySubdomain(subdomain);
        return ResponseEntity.ok(website);
    }

    @GetMapping("/subdomain/{subdomain}/products/available")
    public ResponseEntity<List<ProductResponse>> getAvailableProductsBySubdomain(@PathVariable String subdomain) {
        WebsiteResponse website = websiteService.getWebsiteBySubdomain(subdomain);
        List<ProductResponse> products = productService.getAvailableProducts(website.getId());
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebsiteResponse> updateWebsite(
            @PathVariable Long id,
            @Valid @RequestBody WebsiteRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WebsiteResponse website = websiteService.updateWebsite(id, request, userPrincipal.getId());
        return ResponseEntity.ok(website);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteWebsite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        websiteService.deleteWebsite(id, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Website deleted successfully"));
    }
}
