package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * Retrieves all products from the database
     * @return List of ProductDTO objects containing all product information
     */
    public List<ProductDTO> getAllProducts() {
        // Retrieve all products from database
        // Convert each Product entity to ProductDTO using stream mapping
        // Collect all DTOs into a list and return
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves products with optional search, filter, and sort
     * @param search Search term for product name/description
     * @param category Category filter
     * @param minPrice Minimum price filter
     * @param maxPrice Maximum price filter
     * @param sort Sort field (price_asc, price_desc, name_asc, name_desc)
     * @return Filtered and sorted list of ProductDTOs
     */
    public List<ProductDTO> getAllProducts(String search, String category, Double minPrice, Double maxPrice, String sort) {
        List<Product> products = productRepository.findAll();
        
        // Apply search filter
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
                case "price_asc":
                    products.sort((a, b) -> a.getPrice().compareTo(b.getPrice()));
                    break;
                case "price_desc":
                    products.sort((a, b) -> b.getPrice().compareTo(a.getPrice()));
                    break;
                case "name_asc":
                    products.sort((a, b) -> a.getName().compareToIgnoreCase(b.getName()));
                    break;
                case "name_desc":
                    products.sort((a, b) -> b.getName().compareToIgnoreCase(a.getName()));
                    break;
            }
        }
        
        // Convert all to DTOs and return
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single product by its ID
     * @param id The unique identifier of the product
     * @return ProductDTO containing product information
     * @throws RuntimeException if product with given ID doesn't exist
     */
    public ProductDTO getProductById(Long id) {
        // Search for product in the database by ID
        Product product = productRepository.findById(id)
                // If product not found, throw exception and stop execution
                .orElseThrow(() -> new RuntimeException("Product not found"));
        // If product found, convert entity to DTO and return it
        return convertToDTO(product);
    }

    /**
     * Creates a new product in the database
     * @param productDTO Contains product data to create
     * @return ProductDTO with the newly created product (including generated ID)
     */
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        // Convert DTO to entity object
        Product product = convertToEntity(productDTO);
        // Save the product to database
        // After saving, the product will have an auto-generated ID
        Product savedProduct = productRepository.save(product);
        // Convert the saved entity back to DTO and return it
        return convertToDTO(savedProduct);
    }

    /**
     * Updates an existing product in the database
     * @param id The unique identifier of the product to update
     * @param productDTO Contains the new product data to update
     * @return ProductDTO with updated product information
     * @throws RuntimeException if product with given ID doesn't exist
     */
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        // Find the existing product in the database
        Product product = productRepository.findById(id)
                // If product not found, throw exception and stop update
                .orElseThrow(() -> new RuntimeException("Product not found"));
        // If product found, continue with updating its fields
        
        // Update all product fields with new values from DTO
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setImageUrl(productDTO.getImageUrl());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setCategory(productDTO.getCategory());
        
        // Save the updated product back to the database
        // After saving, changes are persisted permanently
        Product updatedProduct = productRepository.save(product);
        // Convert updated entity to DTO and return it
        return convertToDTO(updatedProduct);
    }

    /**
     * Deletes a product from the database by its ID
     * @param id The unique identifier of the product to delete
     */
    @Transactional
    public void deleteProduct(Long id) {
        // Delete the product from database by ID
        // If product doesn't exist, this will silently do nothing
        productRepository.deleteById(id);
    }

    /**
     * Converts a Product entity to ProductDTO
     * This separates database entities from API response objects
     * @param product The Product entity from database
     * @return ProductDTO object with product data
     */
    private ProductDTO convertToDTO(Product product) {
        // Create new DTO object
        ProductDTO dto = new ProductDTO();
        // Copy all fields from entity to DTO
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory());
        // Return the DTO
        return dto;
    }

    /**
     * Converts a ProductDTO to Product entity
     * This prepares data for database operations
     * @param dto The ProductDTO from API request
     * @return Product entity object ready for database
     */
    private Product convertToEntity(ProductDTO dto) {
        // Create new entity object
        Product product = new Product();
        // Copy all fields from DTO to entity
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setImageUrl(dto.getImageUrl());
        product.setStockQuantity(dto.getStockQuantity());
        product.setCategory(dto.getCategory());
        // Return the entity
        return product;
    }
}

