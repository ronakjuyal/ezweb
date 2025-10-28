package com.ezweb.service;

import com.ezweb.dto.ComponentRegistryRequest;
import com.ezweb.dto.ComponentRegistryResponse;
import com.ezweb.model.ComponentRegistry;
import com.ezweb.repository.ComponentRegistryRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComponentRegistryService {

    private final ComponentRegistryRepository componentRegistryRepository;
    private final ModelMapper modelMapper = new ModelMapper();

    @Transactional
    public ComponentRegistryResponse createComponent(ComponentRegistryRequest request) {
        // Check if component name already exists
        if (componentRegistryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Component name already exists");
        }

        ComponentRegistry component = new ComponentRegistry();
        component.setName(request.getName());
        component.setDescription(request.getDescription());
        component.setS3FileUrl(request.getS3FileUrl());
        component.setSchema(request.getSchema());
        component.setCategory(request.getCategory());
        component.setVersion(request.getVersion());
        component.setActive(true);

        ComponentRegistry savedComponent = componentRegistryRepository.save(component);

        return mapToResponse(savedComponent);
    }

    @Transactional(readOnly = true)
    public List<ComponentRegistryResponse> getAllComponents() {
        List<ComponentRegistry> components = componentRegistryRepository.findAll();
        return components.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComponentRegistryResponse> getActiveComponents() {
        List<ComponentRegistry> components = componentRegistryRepository.findByActiveTrue();
        return components.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComponentRegistryResponse> getComponentsByCategory(String category) {
        List<ComponentRegistry> components = componentRegistryRepository.findByCategory(category);
        return components.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComponentRegistryResponse getComponentById(Long id) {
        ComponentRegistry component = componentRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        return mapToResponse(component);
    }

    @Transactional
    public ComponentRegistryResponse updateComponent(Long id, ComponentRegistryRequest request) {
        ComponentRegistry component = componentRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        // Check if name is being changed and if it's available
        if (!component.getName().equals(request.getName()) &&
                componentRegistryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Component name already exists");
        }

        component.setName(request.getName());
        component.setDescription(request.getDescription());
        component.setS3FileUrl(request.getS3FileUrl());
        component.setSchema(request.getSchema());
        component.setCategory(request.getCategory());
        component.setVersion(request.getVersion());

        ComponentRegistry updatedComponent = componentRegistryRepository.save(component);

        return mapToResponse(updatedComponent);
    }

    @Transactional
    public void deleteComponent(Long id) {
        ComponentRegistry component = componentRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        componentRegistryRepository.delete(component);
    }

    @Transactional
    public void deactivateComponent(Long id) {
        ComponentRegistry component = componentRegistryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found"));

        component.setActive(false);
        componentRegistryRepository.save(component);
    }

    private ComponentRegistryResponse mapToResponse(ComponentRegistry component) {
        return modelMapper.map(component, ComponentRegistryResponse.class);
    }
}
