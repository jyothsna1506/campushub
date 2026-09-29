package com.campushub.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean isCloudinaryConfigured;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {

        if (cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()) {
            Map<String, String> config = new HashMap<>();
            config.put("cloud_name", cloudName);
            config.put("api_key", apiKey);
            config.put("api_secret", apiSecret);
            this.cloudinary = new Cloudinary(config);
            this.isCloudinaryConfigured = true;
        } else {
            this.cloudinary = null;
            this.isCloudinaryConfigured = false;
        }
    }

    public Map<String, String> uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp") && !contentType.equals("image/gif"))) {
            throw new IllegalArgumentException("Only JPEG, PNG, WEBP, and GIF images are supported");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Image file size cannot exceed 5MB");
        }

        if (isCloudinaryConfigured && cloudinary != null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "campushub/profiles",
                        "resource_type", "image"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                if (secureUrl == null) {
                    secureUrl = (String) uploadResult.get("url");
                }
                String publicId = (String) uploadResult.get("public_id");
                return Map.of("url", secureUrl, "publicId", publicId);
            } catch (Exception e) {
                // If remote upload fails in dev/test, fallback safely
            }
        }

        // Safe fallback for dev/tests: Data URI
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        String dataUri = "data:" + contentType + ";base64," + base64;
        String publicId = "local-image-" + System.currentTimeMillis();
        return Map.of("url", dataUri, "publicId", publicId);
    }

    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank() || publicId.startsWith("local-image-")) {
            return;
        }
        if (isCloudinaryConfigured && cloudinary != null) {
            try {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            } catch (Exception ignored) {
            }
        }
    }
}
