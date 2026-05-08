package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SellerService - Service for seller-specific operations
 * 
 * WHAT IT DOES:
 * - Manages products created by the seller
 * - Manages orders for seller's products
 * - Provides statistics and analytics for seller
 * - Only accessible by users with SELLER role
 * 
 * FLOW:
 * 1. Seller makes request → Controller validates seller role
 * 2. Controller calls service method with sellerId
 * 3. Service filters data by sellerId → Returns seller's data
 * 4. Controller sends response to frontend
 */
@Service
@RequiredArgsConstructor
public class SellerService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * getSellerProducts - Retrieves all products created by a seller
     * 
     * WHAT IT DOES:
     * - Fetches products where sellerId matches the seller
     * - Returns products in DTO format
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller
     * 
     * RETURNS:
     * @return List<ProductDTO> - Products created by the seller
     */
    public List<ProductDTO> getSellerProducts(Long sellerId) {
        // Find all products where sellerId matches
        // Returns: List of products created by this seller
        return productRepository.findAll().stream()
                .filter(product -> product.getSellerId() != null && product.getSellerId().equals(sellerId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * getSellerProducts - Retrieves seller's products with filtering and sorting
     * 
     * WHAT IT DOES:
     * - Fetches products by seller with optional search, category, price filters
     * - Applies sorting by price or name
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller
     * @param search - Search term for product name/description
     * @param category - Filter by category
     * @param minPrice - Minimum price filter
     * @param maxPrice - Maximum price filter
     * @param sort - Sorting option: price_asc, price_desc, name_asc, name_desc
     * 
     * RETURNS:
     * @return List<ProductDTO> - Filtered and sorted products
     */
    public List<ProductDTO> getSellerProducts(Long sellerId, String search, String category, Double minPrice, Double maxPrice, String sort) {
        // Get seller's products
        List<Product> products = productRepository.findAll().stream()
                .filter(product -> product.getSellerId() != null && product.getSellerId().equals(sellerId))
                .collect(Collectors.toList());
        
        // Apply search filter (name/description case-insensitive)
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            products = products.stream()
                .filter(p -> p.getName().toLowerCase().contains(searchLower) ||
                           (p.getDescription() != null && p.getDescription().toLowerCase().contains(searchLower)))
                .collect(Collectors.toList());
        }
        
        // Apply category filter
        if (category != null && !category.isEmpty()) {
            products = products.stream()
                .filter(p -> p.getCategory() != null && p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        }
        
        // Apply price filters
        if (minPrice != null) {
            BigDecimal minPriceBD = BigDecimal.valueOf(minPrice);
            products = products.stream()
                .filter(p -> p.getPrice().compareTo(minPriceBD) >= 0)
                .collect(Collectors.toList());
        }
        if (maxPrice != null) {
            BigDecimal maxPriceBD = BigDecimal.valueOf(maxPrice);
            products = products.stream()
                .filter(p -> p.getPrice().compareTo(maxPriceBD) <= 0)
                .collect(Collectors.toList());
        }
        
        // Apply sorting
        if (sort != null && !sort.isEmpty()) {
            switch (sort) {
                case "price_asc": products.sort((a, b) -> a.getPrice().compareTo(b.getPrice())); break;
                case "price_desc": products.sort((a, b) -> b.getPrice().compareTo(a.getPrice())); break;
                case "name_asc": products.sort((a, b) -> a.getName().compareToIgnoreCase(b.getName())); break;
                case "name_desc": products.sort((a, b) -> b.getName().compareToIgnoreCase(a.getName())); break;
            }
        }
        
        return products.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * getSellerOrders - Retrieves seller's orders with filtering and sorting
     * 
     * WHAT IT DOES:
     * - Fetches orders containing seller's products with optional search/status filters
     * - Applies sorting by date or customer name
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller
     * @param search - Search term for customer name/order ID
     * @param status - Filter by order status
     * @param sort - Sorting option: date_asc, date_desc, customer_asc, customer_desc
     * 
     * RETURNS:
     * @return List<Order> - Filtered and sorted orders
     */
    public List<Order> getSellerOrders(Long sellerId, String search, String status, String sort) {
        // Get seller's orders
        List<Order> orders = getSellerOrders(sellerId);
        
        // Apply search filter (order ID or customer name case-insensitive)
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            orders = orders.stream()
                .filter(o -> o.getId().toString().contains(searchLower) ||
                           (o.getUser() != null && o.getUser().getName().toLowerCase().contains(searchLower)))
                .collect(Collectors.toList());
        }
        
        // Apply status filter
        if (status != null && !status.isEmpty()) {
            try {
                Order.OrderStatus filterStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                orders = orders.stream()
                    .filter(o -> o.getStatus() == filterStatus)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status provided, ignore filter
            }
        }
        
        // Apply sorting
        if (sort != null && !sort.isEmpty()) {
            switch (sort) {
                case "date_asc": orders.sort((a, b) -> a.getOrderDate().compareTo(b.getOrderDate())); break;
                case "date_desc": orders.sort((a, b) -> b.getOrderDate().compareTo(a.getOrderDate())); break;
                case "customer_asc": orders.sort((a, b) -> {
                    String nameA = a.getUser() != null ? a.getUser().getName() : "";
                    String nameB = b.getUser() != null ? b.getUser().getName() : "";
                    return nameA.compareToIgnoreCase(nameB);
                }); break;
                case "customer_desc": orders.sort((a, b) -> {
                    String nameA = a.getUser() != null ? a.getUser().getName() : "";
                    String nameB = b.getUser() != null ? b.getUser().getName() : "";
                    return nameB.compareToIgnoreCase(nameA);
                }); break;
            }
        }
        
        return orders;
    }

    /**
     * createProduct - Creates a new product and associates it with seller
     * 
     * WHAT IT DOES:
     * - Creates product with sellerId set to the seller
     * - Product is linked to seller for management
     * 
     * PARAMETERS:
     * @param productDTO - Product data to create
     * @param sellerId - ID of the seller creating the product
     * 
     * RETURNS:
     * @return ProductDTO - Created product with sellerId set
     */
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO, Long sellerId) {
        // Convert DTO to entity
        Product product = convertToEntity(productDTO);
        // Set sellerId to link product to seller
        product.setSellerId(sellerId);
        // Save product to database
        Product savedProduct = productRepository.save(product);
        // Convert back to DTO and return
        return convertToDTO(savedProduct);
    }

    /**
     * updateProduct - Updates a product (only if seller owns it)
     * 
     * WHAT IT DOES:
     * - Updates product details
     * - Verifies seller owns the product before updating
     * 
     * PARAMETERS:
     * @param productId - ID of product to update
     * @param productDTO - Updated product data
     * @param sellerId - ID of the seller
     * 
     * RETURNS:
     * @return ProductDTO - Updated product
     * 
     * THROWS:
     * @throws RuntimeException if product not found or seller doesn't own it
     */
    @Transactional
    public ProductDTO updateProduct(Long productId, ProductDTO productDTO, Long sellerId) {
        // Find product by ID
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify seller owns this product
        if (product.getSellerId() == null || !product.getSellerId().equals(sellerId)) {
            // If seller doesn't own product, throw exception
            throw new RuntimeException("You don't have permission to update this product");
        }
        // If seller owns product, continue with update

        // Check if image URL is being changed - if so, delete old image from Cloudinary
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty() &&
            (productDTO.getImageUrl() == null || !productDTO.getImageUrl().equals(product.getImageUrl()))) {
            try {
                // Delete old image from Cloudinary
                cloudinaryService.deleteImage(product.getImageUrl());
            } catch (Exception e) {
                // Log error but continue with update
                System.err.println("Failed to delete old image: " + e.getMessage());
            }
        }

        // Update product fields
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setCategory(productDTO.getCategory());
        
        // Save updated product
        Product updatedProduct = productRepository.save(product);
        // Convert to DTO and return
        return convertToDTO(updatedProduct);
    }

    /**
     * deleteProduct - Deletes a product (only if seller owns it)
     * 
     * WHAT IT DOES:
     * - Removes product from database
     * - Deletes associated image from Cloudinary
     * - Verifies seller owns the product before deleting
     * 
     * PARAMETERS:
     * @param productId - ID of product to delete
     * @param sellerId - ID of the seller
     * 
     * THROWS:
     * @throws RuntimeException if product not found or seller doesn't own it
     */
    @Transactional
    public void deleteProduct(Long productId, Long sellerId) {
        // Find product by ID
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Verify seller owns this product
        if (product.getSellerId() == null || !product.getSellerId().equals(sellerId)) {
            // If seller doesn't own product, throw exception
            throw new RuntimeException("You don't have permission to delete this product");
        }
        // If seller owns product, delete it
        
        // Delete image from Cloudinary before deleting product from database
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                cloudinaryService.deleteImage(product.getImageUrl());
            } catch (Exception e) {
                // Log error but continue with deletion
                System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
            }
        }
        
        // Delete product from database
        productRepository.deleteById(productId);
    }

    /**
     * getSellerOrders - Retrieves orders containing seller's products
     * 
     * WHAT IT DOES:
     * - Finds all orders that contain products created by the seller
     * - Returns orders with seller's products
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller
     * 
     * RETURNS:
     * @return List<Order> - Orders containing seller's products
     */
    public List<Order> getSellerOrders(Long sellerId) {
        // Get all orders
        List<Order> allOrders = orderRepository.findAll();
        
        // Filter orders that contain seller's products
        // Returns: Orders where at least one item is a product created by this seller
        return allOrders.stream()
            .filter(order -> order.getItems() != null && order.getItems().stream()
                .anyMatch(item -> item != null && item.getProduct() != null
                    && item.getProduct().getSellerId() != null
                    && item.getProduct().getSellerId().equals(sellerId)))
            .collect(Collectors.toList());
    }

    /**
     * getSellerStatistics - Gets statistics for seller dashboard
     * 
     * WHAT IT DOES:
     * - Calculates total products, total orders, total revenue
     * - Provides analytics for seller's business
     * 
     * PARAMETERS:
     * @param sellerId - ID of the seller
     * 
     * RETURNS:
     * @return Map<String, Object> - Statistics data
     */
    public Map<String, Object> getSellerStatistics(Long sellerId) {
        // Get seller's products
        List<Product> sellerProducts = productRepository.findAll().stream()
                .filter(p -> p.getSellerId() != null && p.getSellerId().equals(sellerId))
                .collect(Collectors.toList());

        // Get seller's orders
        List<Order> sellerOrders = getSellerOrders(sellerId);

        // Calculate statistics
        int totalProducts = sellerProducts.size();
        int totalOrders = sellerOrders.size();
        
        // Calculate total revenue from seller's products in orders
        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Order order : sellerOrders) {
            if (order.getItems() == null) continue;
            for (var item : order.getItems()) {
                if (item == null || item.getProduct() == null) continue;
                if (item.getProduct().getSellerId() != null
                        && item.getProduct().getSellerId().equals(sellerId)) {
                    // Add revenue from this item
                    if (item.getPrice() != null && item.getQuantity() != null) {
                        totalRevenue = totalRevenue.add(
                                item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                    }
                }
            }
        }

        // Calculate low stock products (quantity < 10)
        long lowStockProducts = sellerProducts.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 10)
                .count();

        // Create response map
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        // Return numeric value to frontend (JSON number) to allow `.toFixed()` in JS
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue.doubleValue() : 0.0);
        stats.put("lowStockProducts", lowStockProducts);
        
        // Return statistics
        return stats;
    }

    /**
     * Helper method to convert Product entity to ProductDTO
     */
    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory());
        return dto;
    }

    /**
     * Helper method to convert ProductDTO to Product entity
     */
    private Product convertToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setStockQuantity(dto.getStockQuantity());
        product.setCategory(dto.getCategory());
        return product;
    }
}

