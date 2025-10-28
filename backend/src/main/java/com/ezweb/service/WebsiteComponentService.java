package com.ezweb.service;

import com.ezweb.dto.ComponentRegistryResponse;
import com.ezweb.dto.WebsiteComponentRequest;
import com.ezweb.dto.WebsiteComponentResponse;
import com.ezweb.model.ComponentRegistry;
import com.ezweb.model.Website;
import com.ezweb.model.WebsiteComponent;
import com.ezweb.repository.ComponentRegistryRepository;
import com.ezweb.repository.WebsiteComponentRepository;
import com.ezweb.repository.WebsiteRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WebsiteComponentService {

    private final WebsiteComponentRepository websiteComponentRepository;
    private final WebsiteRepository websiteRepository;
    private final ComponentRegistryRepository componentRegistryRepository;
    private final ModelMapper modelMapper = new ModelMapper();

    @Transactional
    public WebsiteComponentResponse addComponentToWebsite(Long websiteId, WebsiteComponentRequest request, Long userId) {
        // Get website and verify ownership
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        // Get component registry
        ComponentRegistry componentRegistry = componentRegistryRepository.findById(request.getComponentRegistryId())
                .orElseThrow(() -> new RuntimeException("Component not found in registry"));

        // Create website component
        WebsiteComponent websiteComponent = new WebsiteComponent();
        websiteComponent.setWebsite(website);
        websiteComponent.setComponentRegistry(componentRegistry);
        websiteComponent.setSchemaData(request.getSchemaData());
        websiteComponent.setPosition(request.getPosition());
        websiteComponent.setVisible(request.getVisible());

        WebsiteComponent savedComponent = websiteComponentRepository.save(websiteComponent);

        return mapToResponse(savedComponent);
    }

    @Transactional(readOnly = true)
    public List<WebsiteComponentResponse> getWebsiteComponents(Long websiteId, Long userId) {
        // Verify website exists and user owns it
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        List<WebsiteComponent> components = websiteComponentRepository.findByWebsiteIdOrderByPositionAsc(websiteId);
        return components.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WebsiteComponentResponse> getVisibleWebsiteComponents(Long websiteId) {
        List<WebsiteComponent> components = websiteComponentRepository.findByWebsiteIdAndVisibleTrueOrderByPositionAsc(websiteId);
        return components.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WebsiteComponentResponse getComponentById(Long id, Long userId) {
        WebsiteComponent component = websiteComponentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        if (!component.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to component");
        }

        return mapToResponse(component);
    }

    @Transactional
    public WebsiteComponentResponse updateWebsiteComponent(Long id, WebsiteComponentRequest request, Long userId) {
        WebsiteComponent component = websiteComponentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        if (!component.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to component");
        }

        component.setSchemaData(request.getSchemaData());
        component.setPosition(request.getPosition());
        component.setVisible(request.getVisible());

        WebsiteComponent updatedComponent = websiteComponentRepository.save(component);

        return mapToResponse(updatedComponent);
    }

    @Transactional
    public void deleteWebsiteComponent(Long id, Long userId) {
        WebsiteComponent component = websiteComponentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        if (!component.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to component");
        }

        websiteComponentRepository.delete(component);
    }

    @Transactional
    public void reorderComponents(Long websiteId, List<Long> componentIds, Long userId) {
        // Verify website exists and user owns it
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        // Update positions
        for (int i = 0; i < componentIds.size(); i++) {
            Long componentId = componentIds.get(i);
            WebsiteComponent component = websiteComponentRepository.findById(componentId)
                    .orElseThrow(() -> new RuntimeException("Component not found: " + componentId));

            if (!component.getWebsite().getId().equals(websiteId)) {
                throw new RuntimeException("Component does not belong to this website");
            }

            component.setPosition(i);
            websiteComponentRepository.save(component);
        }
    }

    private WebsiteComponentResponse mapToResponse(WebsiteComponent component) {
        WebsiteComponentResponse response = new WebsiteComponentResponse();
        response.setId(component.getId());
        response.setWebsiteId(component.getWebsite().getId());
        response.setSchemaData(component.getSchemaData());
        response.setPosition(component.getPosition());
        response.setVisible(component.getVisible());
        response.setCreatedAt(component.getCreatedAt());
        response.setUpdatedAt(component.getUpdatedAt());

        // Map component registry
        ComponentRegistryResponse registryResponse = modelMapper.map(
                component.getComponentRegistry(),
                ComponentRegistryResponse.class
        );
        response.setComponentRegistry(registryResponse);

        return response;
    }
}
