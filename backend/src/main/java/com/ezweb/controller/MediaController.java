package com.ezweb.controller;

import com.ezweb.dto.ApiResponse;
import com.ezweb.model.Media;
import com.ezweb.security.UserPrincipal;
import com.ezweb.service.MediaService;
import com.ezweb.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;
    private final S3Service s3Service;

    @PostMapping("/media/upload")
    public ResponseEntity<Media> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "uploads") String folder,
            @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {
        Media media = mediaService.uploadFile(file, folder, userPrincipal.getId());
        return new ResponseEntity<>(media, HttpStatus.CREATED);
    }

    @PostMapping("/websites/{websiteId}/media")
    public ResponseEntity<Media> uploadMedia(
            @PathVariable Long websiteId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {
        Media media = mediaService.uploadMedia(websiteId, file, userPrincipal.getId());
        return new ResponseEntity<>(media, HttpStatus.CREATED);
    }

    @GetMapping("/websites/{websiteId}/media")
    public ResponseEntity<List<Media>> getWebsiteMedia(
            @PathVariable Long websiteId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Media> mediaList = mediaService.getWebsiteMedia(websiteId, userPrincipal.getId());
        return ResponseEntity.ok(mediaList);
    }

    @GetMapping("/websites/{websiteId}/media/type/{type}")
    public ResponseEntity<List<Media>> getMediaByType(
            @PathVariable Long websiteId,
            @PathVariable Media.MediaType type,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Media> mediaList = mediaService.getMediaByType(websiteId, type, userPrincipal.getId());
        return ResponseEntity.ok(mediaList);
    }

    @GetMapping("/media/{id}")
    public ResponseEntity<Media> getMediaById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Media media = mediaService.getMediaById(id, userPrincipal.getId());
        return ResponseEntity.ok(media);
    }

    @DeleteMapping("/media/{id}")
    public ResponseEntity<ApiResponse> deleteMedia(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        mediaService.deleteMedia(id, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Media deleted successfully"));
    }

    @PostMapping("/admin/s3/configure-cors")
    public ResponseEntity<ApiResponse> configureS3Cors() {
        s3Service.configureBucketCors();
        return ResponseEntity.ok(new ApiResponse(true, "CORS configured successfully"));
    }
}
