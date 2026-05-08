package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * SellerController - REST Controller for seller operations
 * 
 * WHAT IT DOES:
 * - Handles HTTP requests for seller-specific operations
 * - Manages products created by seller
 * - Manages orders for seller's products
 * - Provides statistics for seller dashboard
 * - Only accessible by users with SELLER role
 * 
 * ENDPOINTS:
 * - GET /api/seller/products - Get seller's products
 * - POST /api/seller/products - Create new product
 * - PUT /api/seller/products/{id} - Update product
 * - DELETE /api/seller/products/{id} - Delete product
 * - GET /api/seller/orders - Get seller's orders
 * - GET /api/seller/statistics - Get seller statistics
 * 
 * FLOW:
 * 1. Seller makes request → Controller receives it with sellerId
 * 2. Controller calls service with sellerId → Service filters by sellerId
 * 3. Service returns seller's data → Controller sends HTTP response
 * 4. Frontend receives response → Updates seller dashboard
 */
@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    /**
     * getSellerProducts - Gets all products created by the seller with optional filters
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller (from authenticated user)
     * @param search - Optional search term for product name/description
     * @param category - Optional category filter
     * @param minPrice - Optional minimum price filter
     * @param maxPrice - Optional maximum price filter
     * @param sort - Optional sorting: price_asc, price_desc, name_asc, name_desc
     * 
     * RETURNS:
     * @return ResponseEntity<List<ProductDTO>> - HTTP 200 OK with seller's products
     */
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getSellerProducts(
            @RequestParam Long sellerId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sort) {
        // Get products created by this seller with optional filtering
        // If no filters provided, returns all seller's products
        return ResponseEntity.ok(sellerService.getSellerProducts(sellerId, search, category, minPrice, maxPrice, sort));
    }

    /**
     * createProduct - Creates a new product for the seller
     * 
     * PARAMETERS:
     * @param productDTO - Product data to create
     * @param sellerId - ID of the seller (from authenticated user)
     * 
     * RETURNS:
     * @return ResponseEntity<ProductDTO> - HTTP 201 Created with created product
     */
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(
            @RequestBody ProductDTO productDTO,
            @RequestParam Long sellerId) {
        // Create product and link it to seller
        // Returns: Created product with sellerId set
        ProductDTO createdProduct = sellerService.createProduct(productDTO, sellerId);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * updateProduct - Updates a product (only if seller owns it)
     * 
     * PARAMETERS:
     * @param productId - ID of product to update
     * @param productDTO - Updated product data
     * @param sellerId - ID of the seller (from authenticated user)
     * 
     * RETURNS:
     * @return ResponseEntity<ProductDTO> - HTTP 200 OK with updated product
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable("id") Long productId,
            @RequestBody ProductDTO productDTO,
            @RequestParam Long sellerId) {
        // Update product if seller owns it
        // Returns: Updated product
        ProductDTO updatedProduct = sellerService.updateProduct(productId, productDTO, sellerId);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * deleteProduct - Deletes a product (only if seller owns it)
     * 
     * PARAMETERS:
     * @param productId - ID of product to delete
     * @param sellerId - ID of the seller (from authenticated user)
     * 
     * RETURNS:
     * @return ResponseEntity<Void> - HTTP 204 No Content
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable("id") Long productId,
            @RequestParam Long sellerId) {
        // Delete product if seller owns it
        sellerService.deleteProduct(productId, sellerId);
        return ResponseEntity.noContent().build();
    }

    /**
     * getSellerOrders - Gets orders containing seller's products with optional filters
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller (from authenticated user)
     * @param search - Optional search term for customer name or order ID
     * @param status - Optional status filter
     * @param sort - Optional sorting: date_asc, date_desc, customer_asc, customer_desc
     * 
     * RETURNS:
     * @return ResponseEntity<List<Order>> - HTTP 200 OK with seller's orders
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getSellerOrders(
            @RequestParam Long sellerId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort) {
        // Get orders that contain seller's products with optional filtering
        // If no filters provided, returns all seller's orders
        return ResponseEntity.ok(sellerService.getSellerOrders(sellerId, search, status, sort));
    }

    /**
     * getSellerStatistics - Gets statistics for seller dashboard
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller (from authenticated user)
     * 
     * RETURNS:
     * @return ResponseEntity<Map<String, Object>> - HTTP 200 OK with statistics
     *   Contains: totalProducts, totalOrders, totalRevenue, lowStockProducts
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSellerStatistics(@RequestParam Long sellerId) {
        // Get statistics for seller's business
        // Returns: Map with product count, order count, revenue, low stock count
        return ResponseEntity.ok(sellerService.getSellerStatistics(sellerId));
    }
}

