package com.ecommerce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * CloudinaryService - Service for handling image uploads to Cloudinary cloud storage
 * 
 * WHAT IT DOES:
 * - Uploads image files to Cloudinary cloud storage with format validation
 * - Deletes images from Cloudinary when needed
 * - Returns public URLs for uploaded images
 * - Supports all common image formats: JPG, PNG, GIF, WebP, etc.
 * 
 * FLOW:
 * 1. Receives image file from controller
 * 2. Validates file format and size
 * 3. Uploads file to Cloudinary using API credentials
 * 4. Cloudinary stores image and returns metadata
 * 5. Extracts public URL and public ID from response
 * 6. Returns URL to controller → saved with product in database
 */
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);
    
    // Injected Cloudinary client (configured in CloudinaryConfig)
    // This client handles communication with Cloudinary API
    private final Cloudinary cloudinary;
    
    // Allowed image formats
    private static final String[] ALLOWED_FORMATS = {"image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"};
    
    // Maximum file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * uploadImage - Uploads an image file to Cloudinary
     * 
     * WHAT IT DOES:
     * - Takes uploaded file from frontend
     * - Validates file format and size
     * - Uploads file bytes to Cloudinary cloud storage
     * - Gets public URL and public ID from Cloudinary response
     * - Returns URL that can be stored in database
     * 
     * PARAMETERS:
     * @param file - MultipartFile object containing the image file data
     * 
     * RETURNS:
     * @return String - Public URL of the uploaded image on Cloudinary
     *   Example: "https://res.cloudinary.com/cloudname/image/upload/v1234567/image.jpg"
     * 
     * THROWS:
     * @throws IOException - If file upload fails (network error, invalid file, etc.)
     * @throws IllegalArgumentException - If file format or size is invalid
     * 
     * FLOW:
     * 1. Controller receives file from frontend → calls this method
     * 2. Validates file format against allowed types
     * 3. Validates file size doesn't exceed limit
     * 4. Extracts file bytes from MultipartFile
     * 5. Calls Cloudinary API to upload file → sends file bytes
     * 6. Cloudinary processes file → stores in cloud → returns metadata
     * 7. Extracts "url" field from response map
     * 8. Returns URL string → controller saves it with product
     * 
     * WHAT HAPPENS NEXT:
     * - URL is returned to controller
     * - Controller saves URL in product.imageUrl field
     * - Product is saved to database with image URL
     * - Frontend can display image using this URL
     */
    public String uploadImage(MultipartFile file) throws IOException {
        // Validate file format
        if (!isValidImageFormat(file.getContentType())) {
            throw new IllegalArgumentException("Invalid image format. Allowed formats: JPG, PNG, GIF, WebP, BMP, TIFF");
        }
        
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        try {
            // Upload file bytes to Cloudinary
            // upload() method returns a Map with upload metadata
            // Set resource_type to "auto" to automatically detect image type
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "auto"
                // Note: folder parameter removed - it requires valid API credentials
                // Images will be stored in the root of Cloudinary account
            ));
            
            // Extract "url" field from response map
            // This is the public URL where the image can be accessed
            String imageUrl = (String) uploadResult.get("url");
            logger.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
        } catch (IOException e) {
            logger.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new IOException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * deleteImage - Deletes an image from Cloudinary storage using URL
     * 
     * WHAT IT DOES:
     * - Extracts public ID from image URL
     * - Removes image from Cloudinary using its public ID
     * - Useful when product is deleted or image is replaced
     * 
     * PARAMETERS:
     * @param imageUrl - The full URL of the image in Cloudinary
     *   Example: "https://res.cloudinary.com/cloudname/image/upload/v1234567/ecommerce_products/image.jpg"
     * 
     * RETURNS:
     * @return void - Nothing returned, image is deleted
     * 
     * THROWS:
     * @throws IOException - If deletion fails
     */
    public void deleteImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isEmpty()) {
            logger.warn("Attempted to delete null or empty image URL");
            return;
        }
        
        try {
            // Extract public ID from URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            
            if (publicId != null && !publicId.isEmpty()) {
                // Delete image from Cloudinary using its public ID
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                logger.info("Image deleted successfully from Cloudinary: {}", publicId);
            }
        } catch (IOException e) {
            logger.error("Failed to delete image from Cloudinary: {}", e.getMessage());
            // Don't throw - allow deletion to continue even if image removal fails
        }
    }

    /**
     * extractPublicIdFromUrl - Extracts public ID from Cloudinary URL
     * 
     * WHAT IT DOES:
     * - Parses Cloudinary URL to extract the public ID
     * - Public ID is used to identify/delete images in Cloudinary
     * 
     * PARAMETERS:
     * @param imageUrl - Full Cloudinary image URL
     *   Example: "https://res.cloudinary.com/cloudname/image/upload/v1234567/image.jpg"
     * 
     * RETURNS:
     * @return String - Public ID extracted from URL
     *   Example: "image"
     * 
     * FLOW:
     * 1. Find "upload/" in URL to locate the separator
     * 2. Extract everything after "upload/v{version}/" (skip version number)
     * 3. Remove file extension to get public ID
     * 4. Return public ID for use in deletion
     */
    private String extractPublicIdFromUrl(String imageUrl) {
        try {
            // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
            // OR: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{filename}.{ext}
            // We need to extract: {folder}/{filename} or {filename}
            
            String[] parts = imageUrl.split("/upload/");
            if (parts.length < 2) {
                return null;
            }
            
            String afterUpload = parts[1];
            // Skip version: v{digits}/
            String[] versionParts = afterUpload.split("/", 2);
            if (versionParts.length < 2) {
                return null;
            }
            
            String filePath = versionParts[1];
            // Remove file extension
            if (filePath.contains(".")) {
                filePath = filePath.substring(0, filePath.lastIndexOf("."));
            }
            
            return filePath;
        } catch (Exception e) {
            logger.warn("Failed to extract public ID from URL: {}", imageUrl);
            return null;
        }
    }

    /**
     * isValidImageFormat - Validates if the file is a supported image format
     * 
     * PARAMETERS:
     * @param contentType - MIME type of the file (e.g., "image/jpeg")
     * 
     * RETURNS:
     * @return boolean - true if format is allowed, false otherwise
     */
    private boolean isValidImageFormat(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        for (String format : ALLOWED_FORMATS) {
            if (contentType.equals(format)) {
                return true;
            }
        }
        return false;
    }
}


