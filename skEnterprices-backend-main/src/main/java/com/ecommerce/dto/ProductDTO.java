package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * ProductDTO - Data Transfer Object for Product
 * 
 * WHAT IT DOES:
 * - Represents product data sent between frontend and backend
 * - Separates API layer from database entity layer
 * - Used in REST API requests and responses
 * 
 * FLOW:
 * 1. Frontend sends ProductDTO in POST/PUT requests → backend receives it
 * 2. Backend converts DTO to Product entity → saves to database
 * 3. Backend retrieves Product entity → converts to DTO → sends to frontend
 * 4. Frontend receives ProductDTO → displays product information
 * 
 * WHY USE DTO:
 * - Prevents exposing internal entity structure
 * - Allows different data formats for API vs database
 * - Provides flexibility to change entities without breaking API
 * 
 * ANNOTATIONS:
 * - @Data: Lombok generates getters, setters, toString, equals, hashCode
 * - @NoArgsConstructor: Lombok generates constructor with no parameters
 * - @AllArgsConstructor: Lombok generates constructor with all fields
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    /**
     * Product ID - Unique identifier
     * Used in: GET /api/products/{id}, PUT /api/products/{id}
     */
    private Long id;
    
    /**
     * Product name - Display name of the product
     * Example: "Wireless Headphones", "Laptop Stand"
     */
    private String name;
    
    /**
     * Product description - Detailed information about the product
     * Example: "High-quality wireless headphones with noise cancellation"
     */
    private String description;
    
    /**
     * Product price - Price in decimal format
     * Example: 99.99, 1299.00
     * Uses BigDecimal for precise decimal calculations
     */
    private BigDecimal price;
    
    /**
     * Image URL - URL of product image stored in Cloudinary
     * Example: "https://res.cloudinary.com/cloudname/image/upload/v123/image.jpg"
     * Can be null if no image uploaded
     */
    private String imageUrl;
    
    /**
     * Stock quantity - Number of items available
     * Example: 10, 0 (out of stock)
     */
    private Integer stockQuantity;
    
    /**
     * Product category - Optional categorization
     * Example: "Electronics", "Clothing", "Home & Garden"
     */
    private String category;
}

