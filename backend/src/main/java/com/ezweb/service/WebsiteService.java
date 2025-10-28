package com.ezweb.service;

import com.ezweb.dto.WebsiteRequest;
import com.ezweb.dto.WebsiteResponse;
import com.ezweb.model.User;
import com.ezweb.model.Website;
import com.ezweb.repository.UserRepository;
import com.ezweb.repository.WebsiteRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WebsiteService {

    private final WebsiteRepository websiteRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper = new ModelMapper();

    @Transactional
    public WebsiteResponse createWebsite(WebsiteRequest request, Long userId) {
        // Check if subdomain already exists
        if (websiteRepository.existsBySubdomain(request.getSubdomain())) {
            throw new RuntimeException("Subdomain is already taken");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create website
        Website website = new Website();
        website.setUser(user);
        website.setSubdomain(request.getSubdomain());
        website.setTitle(request.getTitle());
        website.setDescription(request.getDescription());
        website.setPublished(request.getPublished() != null ? request.getPublished() : false);

        Website savedWebsite = websiteRepository.save(website);

        return mapToResponse(savedWebsite);
    }

    @Transactional(readOnly = true)
    public List<WebsiteResponse> getUserWebsites(Long userId) {
        List<Website> websites = websiteRepository.findByUserId(userId);
        return websites.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WebsiteResponse getWebsiteById(Long id, Long userId) {
        Website website = websiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        // Check if user owns the website
        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        return mapToResponse(website);
    }

    @Transactional(readOnly = true)
    public WebsiteResponse getWebsiteBySubdomain(String subdomain) {
        Website website = websiteRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        return mapToResponse(website);
    }

    @Transactional
    public WebsiteResponse updateWebsite(Long id, WebsiteRequest request, Long userId) {
        Website website = websiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        // Check if user owns the website
        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        // Check if subdomain is being changed and if it's available
        if (!website.getSubdomain().equals(request.getSubdomain()) &&
                websiteRepository.existsBySubdomain(request.getSubdomain())) {
            throw new RuntimeException("Subdomain is already taken");
        }

        website.setSubdomain(request.getSubdomain());
        website.setTitle(request.getTitle());
        website.setDescription(request.getDescription());
        website.setPublished(request.getPublished());

        Website updatedWebsite = websiteRepository.save(website);

        return mapToResponse(updatedWebsite);
    }

    @Transactional
    public void deleteWebsite(Long id, Long userId) {
        Website website = websiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        // Check if user owns the website
        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        websiteRepository.delete(website);
    }

    private WebsiteResponse mapToResponse(Website website) {
        return modelMapper.map(website, WebsiteResponse.class);
    }
}
