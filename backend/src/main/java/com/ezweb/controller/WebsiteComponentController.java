package com.ezweb.controller;

import com.ezweb.dto.ApiResponse;
import com.ezweb.dto.WebsiteComponentRequest;
import com.ezweb.dto.WebsiteComponentResponse;
import com.ezweb.security.UserPrincipal;
import com.ezweb.service.WebsiteComponentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/websites/{websiteId}/components")
@RequiredArgsConstructor
public class WebsiteComponentController {

    private final WebsiteComponentService websiteComponentService;

    @PostMapping
    public ResponseEntity<WebsiteComponentResponse> addComponent(
            @PathVariable Long websiteId,
            @Valid @RequestBody WebsiteComponentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WebsiteComponentResponse response = websiteComponentService.addComponentToWebsite(
                websiteId, request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<WebsiteComponentResponse>> getWebsiteComponents(
            @PathVariable Long websiteId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<WebsiteComponentResponse> components = websiteComponentService.getWebsiteComponents(
                websiteId, userPrincipal.getId());
        return ResponseEntity.ok(components);
    }

    @GetMapping("/visible")
    public ResponseEntity<List<WebsiteComponentResponse>> getVisibleComponents(@PathVariable Long websiteId) {
        List<WebsiteComponentResponse> components = websiteComponentService.getVisibleWebsiteComponents(websiteId);
        return ResponseEntity.ok(components);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebsiteComponentResponse> getComponentById(
            @PathVariable Long websiteId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WebsiteComponentResponse component = websiteComponentService.getComponentById(id, userPrincipal.getId());
        return ResponseEntity.ok(component);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebsiteComponentResponse> updateComponent(
            @PathVariable Long websiteId,
            @PathVariable Long id,
            @Valid @RequestBody WebsiteComponentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        WebsiteComponentResponse component = websiteComponentService.updateWebsiteComponent(
                id, request, userPrincipal.getId());
        return ResponseEntity.ok(component);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteComponent(
            @PathVariable Long websiteId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        websiteComponentService.deleteWebsiteComponent(id, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Component deleted successfully"));
    }

    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse> reorderComponents(
            @PathVariable Long websiteId,
            @RequestBody List<Long> componentIds,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        websiteComponentService.reorderComponents(websiteId, componentIds, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Components reordered successfully"));
    }
}
