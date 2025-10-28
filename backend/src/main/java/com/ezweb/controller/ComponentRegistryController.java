package com.ezweb.controller;

import com.ezweb.dto.ApiResponse;
import com.ezweb.dto.ComponentRegistryRequest;
import com.ezweb.dto.ComponentRegistryResponse;
import com.ezweb.service.ComponentRegistryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComponentRegistryController {

    private final ComponentRegistryService componentRegistryService;

    // Admin endpoints
    @PostMapping("/admin/components")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComponentRegistryResponse> createComponent(
            @Valid @RequestBody ComponentRegistryRequest request) {
        ComponentRegistryResponse response = componentRegistryService.createComponent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/admin/components")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ComponentRegistryResponse>> getAllComponents() {
        List<ComponentRegistryResponse> components = componentRegistryService.getAllComponents();
        return ResponseEntity.ok(components);
    }

    @PutMapping("/admin/components/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComponentRegistryResponse> updateComponent(
            @PathVariable Long id,
            @Valid @RequestBody ComponentRegistryRequest request) {
        ComponentRegistryResponse response = componentRegistryService.updateComponent(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/components/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteComponent(@PathVariable Long id) {
        componentRegistryService.deleteComponent(id);
        return ResponseEntity.ok(new ApiResponse(true, "Component deleted successfully"));
    }

    @PatchMapping("/admin/components/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deactivateComponent(@PathVariable Long id) {
        componentRegistryService.deactivateComponent(id);
        return ResponseEntity.ok(new ApiResponse(true, "Component deactivated successfully"));
    }

    // Public/User endpoints
    @GetMapping("/components")
    public ResponseEntity<List<ComponentRegistryResponse>> getActiveComponents() {
        List<ComponentRegistryResponse> components = componentRegistryService.getActiveComponents();
        return ResponseEntity.ok(components);
    }

    @GetMapping("/components/{id}")
    public ResponseEntity<ComponentRegistryResponse> getComponentById(@PathVariable Long id) {
        ComponentRegistryResponse component = componentRegistryService.getComponentById(id);
        return ResponseEntity.ok(component);
    }

    @GetMapping("/components/category/{category}")
    public ResponseEntity<List<ComponentRegistryResponse>> getComponentsByCategory(@PathVariable String category) {
        List<ComponentRegistryResponse> components = componentRegistryService.getComponentsByCategory(category);
        return ResponseEntity.ok(components);
    }
}
