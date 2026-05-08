package com.ecommerce.controller;

import com.ecommerce.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * CloudinaryController - REST endpoint for image uploads to Cloudinary
 * 
 * WHAT IT DOES:
 * - Receives image files from frontend
 * - Validates file formats (JPG, PNG, GIF, WebP, BMP, TIFF)
 * - Uploads files to Cloudinary cloud storage
 * - Returns public URLs for uploaded images
 * - Handles errors and provides meaningful error messages
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    /**
     * REST endpoint for uploading images to Cloudinary
     * Handles POST requests to /api/upload/image
     * 
     * WHAT IT DOES:
     * - Receives multipart file from frontend
     * - Validates file format and size
     * - Uploads to Cloudinary
     * - Returns image URL on success or error message on failure
     * 
     * PARAMETERS:
     * @param file - The image file to upload (multipart/form-data)
     *   Accepted formats: JPEG, PNG, GIF, WebP, BMP, TIFF
     *   Max size: 5MB
     * 
     * RETURNS:
     * @return ResponseEntity with:
     *   - 200 OK: { "url": "https://res.cloudinary.com/.../image.jpg" }
     *   - 400 Bad Request: { "error": "Error message" }
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file is not empty
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("File is empty"));
            }
            
            // Upload the image file to Cloudinary cloud storage
            // After successful upload, Cloudinary returns a public URL for the image
            String imageUrl = cloudinaryService.uploadImage(file);
            
            // Create response map with the image URL
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            
            // Return 200 OK status with the image URL
            // Frontend can use this URL to display the uploaded image
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            // Handle validation errors (invalid format, file too large)
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
            
        } catch (Exception e) {
            // If upload fails (network error, invalid file, Cloudinary error, etc.),
            // catch the exception and return error response
            String errorMsg = "Failed to upload image";
            if (e.getMessage() != null) {
                errorMsg += ": " + e.getMessage();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(errorMsg));
        }
    }

    /**
     * Helper method to create error response map
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
