package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.dto.ShippingInfoDTO;
import com.ecommerce.entity.*;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Creates a new order in the system
     * @param orderDTO Contains order details (items, shipping info, total)
     * @param userId Optional user ID if order is associated with a registered user
     * @return Saved Order entity with all order details
     */
    @Transactional
    public Order createOrder(OrderDTO orderDTO, Long userId) {
        // Create a new Order entity object
        Order order = new Order();
        
        // Check if a user ID was provided (for registered users)
        if (userId != null) {
            // If userId is provided, find the user in the database
            User user = userRepository.findById(userId)
                    // If user not found, throw exception and stop order creation
                    .orElseThrow(() -> new RuntimeException("User not found"));
            // If user found, associate the order with this user
            order.setUser(user);
        }
        // If userId is null, order is created as guest checkout (no user association)

        // Extract shipping information from the DTO
        ShippingInfoDTO shippingInfoDTO = orderDTO.getShippingInfo();
        // Convert DTO to entity object
        ShippingInfo shippingInfo = new ShippingInfo(
                shippingInfoDTO.getName(),
                shippingInfoDTO.getEmail(),
                shippingInfoDTO.getAddress(),
                shippingInfoDTO.getCity(),
                shippingInfoDTO.getZipCode()
        );
        // Attach shipping info to the order
        order.setShippingInfo(shippingInfo);

        // Initialize total price to zero
        BigDecimal total = BigDecimal.ZERO;
        // Loop through each item in the order
        for (OrderItemDTO itemDTO : orderDTO.getItems()) {
            // Create a new OrderItem entity for each product in the order
            OrderItem orderItem = new OrderItem();
            // Link this item to the parent order
            orderItem.setOrder(order);
            
            // Try to find the product in the database by ID
            Product product = productRepository.findById(itemDTO.getId())
                    .orElseGet(() -> {
                        // If product doesn't exist in database (e.g., deleted product),
                        // create a temporary product object from DTO data
                        // This allows orders to be created even if product was removed
                        Product tempProduct = new Product();
                        tempProduct.setId(itemDTO.getId());
                        tempProduct.setName(itemDTO.getName());
                        tempProduct.setPrice(itemDTO.getPrice());
                        return tempProduct;
                    });
            // If product found, use the existing product; otherwise use temporary one
            
            // Set product details for this order item
            orderItem.setProduct(product);
            
            // Validate quantity is not null and greater than 0
            if (itemDTO.getQuantity() == null || itemDTO.getQuantity() <= 0) {
                throw new RuntimeException("Invalid quantity for product: " + itemDTO.getName());
            }
            orderItem.setQuantity(itemDTO.getQuantity());
            
            // Validate price is not null
            if (itemDTO.getPrice() == null) {
                throw new RuntimeException("Invalid price for product: " + itemDTO.getName());
            }
            orderItem.setPrice(itemDTO.getPrice());
            
            // Calculate subtotal for this item: price * quantity
            // Add it to the running total
            total = total.add(itemDTO.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
            // Add this item to the order's item list
            order.getItems().add(orderItem);
        }
        // After processing all items, total contains the sum of all item prices

        // Set the final total price for the order
        order.setTotal(total);
        // Save the complete order to the database
        // After saving, the order will have an auto-generated ID
        return orderRepository.save(order);
    }

    /**
     * Retrieves all orders placed by a specific user
     * @param userId The unique identifier of the user
     * @return List of Order entities for the specified user
     */
    public List<Order> getOrdersByUser(Long userId) {
        // Query database to find all orders associated with this user ID
        // Returns empty list if user has no orders
        return orderRepository.findByUserId(userId);
    }
}

