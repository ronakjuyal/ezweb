package com.ezweb.service;

import com.ezweb.model.Media;
import com.ezweb.model.Website;
import com.ezweb.repository.MediaRepository;
import com.ezweb.repository.WebsiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final WebsiteRepository websiteRepository;
    private final S3Service s3Service;

    @Transactional
    public Media uploadFile(MultipartFile file, String folder, Long userId) throws IOException {
        // Upload to S3
        String s3Url = s3Service.uploadFile(file, folder);

        // Determine media type
        Media.MediaType mediaType = determineMediaType(file.getContentType());

        // Create media record without website association
        Media media = new Media();
        media.setFilename(file.getOriginalFilename());
        media.setS3Url(s3Url);
        media.setType(mediaType);
        media.setSize(file.getSize());
        media.setMimeType(file.getContentType());

        return mediaRepository.save(media);
    }

    @Transactional
    public Media uploadMedia(Long websiteId, MultipartFile file, Long userId) throws IOException {
        // Get website and verify ownership
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        // Upload to S3
        String folder = "media/" + websiteId;
        String s3Url = s3Service.uploadFile(file, folder);

        // Determine media type
        Media.MediaType mediaType = determineMediaType(file.getContentType());

        // Create media record
        Media media = new Media();
        media.setWebsite(website);
        media.setFilename(file.getOriginalFilename());
        media.setS3Url(s3Url);
        media.setType(mediaType);
        media.setSize(file.getSize());
        media.setMimeType(file.getContentType());

        return mediaRepository.save(media);
    }

    @Transactional(readOnly = true)
    public List<Media> getWebsiteMedia(Long websiteId, Long userId) {
        // Verify website exists and user owns it
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        return mediaRepository.findByWebsiteId(websiteId);
    }

    @Transactional(readOnly = true)
    public List<Media> getMediaByType(Long websiteId, Media.MediaType type, Long userId) {
        // Verify website exists and user owns it
        Website website = websiteRepository.findById(websiteId)
                .orElseThrow(() -> new RuntimeException("Website not found"));

        if (!website.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to website");
        }

        return mediaRepository.findByWebsiteIdAndType(websiteId, type);
    }

    @Transactional(readOnly = true)
    public Media getMediaById(Long id, Long userId) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        // Only check ownership if media is associated with a website
        if (media.getWebsite() != null && !media.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to media");
        }

        return media;
    }

    @Transactional
    public void deleteMedia(Long id, Long userId) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Media not found"));

        // Only check ownership if media is associated with a website
        if (media.getWebsite() != null && !media.getWebsite().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to media");
        }

        // Extract key from S3 URL
        String s3Url = media.getS3Url();
        String key = extractKeyFromUrl(s3Url);

        // Delete from S3
        s3Service.deleteFile(key);

        // Delete from database
        mediaRepository.delete(media);
    }

    private Media.MediaType determineMediaType(String contentType) {
        if (contentType == null) {
            return Media.MediaType.OTHER;
        }

        if (contentType.startsWith("image/")) {
            return Media.MediaType.IMAGE;
        } else if (contentType.startsWith("video/")) {
            return Media.MediaType.VIDEO;
        } else if (contentType.startsWith("application/pdf") ||
                contentType.contains("document") ||
                contentType.contains("text")) {
            return Media.MediaType.DOCUMENT;
        } else {
            return Media.MediaType.OTHER;
        }
    }

    private String extractKeyFromUrl(String s3Url) {
        // Extract key from URL like: https://bucket-name.s3.amazonaws.com/key
        int lastSlash = s3Url.lastIndexOf('/');
        if (lastSlash != -1) {
            return s3Url.substring(lastSlash + 1);
        }
        return s3Url;
    }
}
