package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.Order;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * OrderController - REST Controller for handling order-related HTTP requests
 * 
 * WHAT IT DOES:
 * - Handles HTTP requests related to orders (create, retrieve)
 * - Maps HTTP requests to service layer methods
 * - Returns appropriate HTTP responses with order data
 * 
 * ENDPOINTS:
 * - POST /api/orders - Creates a new order
 * - GET /api/orders/user/{userId} - Gets all orders for a user
 * 
 * FLOW:
 * 1. Frontend sends HTTP request → Spring routes to appropriate method
 * 2. Method receives request data → calls service layer
 * 3. Service processes business logic → returns entity
 * 4. Controller wraps entity in ResponseEntity → sends HTTP response
 * 5. Frontend receives response → updates UI
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class OrderController {

    // Injected OrderService dependency for business logic
    private final OrderService orderService;

    /**
     * createOrder - REST endpoint for creating a new order
     * 
     * WHAT IT DOES:
     * - Receives order data from frontend (items, shipping info, total)
     * - Optionally associates order with a user (if userId provided)
     * - Creates order in database through service layer
     * - Returns created order with HTTP 201 Created status
     * 
     * PARAMETERS:
     * @param orderDTO - OrderDTO object containing:
     *   - items: List of OrderItemDTO (products with quantities)
     *   - total: Total price of the order
     *   - shippingInfo: ShippingInfoDTO with address details
     * @param userId - Optional user ID (can be null for guest checkout)
     * 
     * RETURNS:
     * @return ResponseEntity<Order> - HTTP 201 Created with created Order entity
     * 
     * FLOW:
     * 1. Frontend sends POST request with order data → this method receives it
     * 2. Calls orderService.createOrder() → service creates order in database
     * 3. Service returns Order entity with generated ID
     * 4. Wraps Order in ResponseEntity with 201 status → sends to frontend
     * 5. Frontend receives order confirmation → shows success message
     * 
     * WHAT HAPPENS NEXT:
     * - Order is saved in database
     * - Frontend can display order confirmation
     * - User receives order details
     */
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderDTO orderDTO,
            @RequestParam(required = false) Long userId) {
        // Call service to create order in database
        // Returns: Order entity with all details including generated ID
        Order order = orderService.createOrder(orderDTO, userId);
        // Return HTTP 201 Created status with order data
        // Frontend receives this and can display order confirmation
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    /**
     * getOrdersByUser - REST endpoint for retrieving user's order history
     * 
     * WHAT IT DOES:
     * - Fetches all orders placed by a specific user
     * - Returns list of orders with all details (items, shipping, status)
     * 
     * PARAMETERS:
     * @param userId - The unique identifier of the user
     * 
     * RETURNS:
     * @return ResponseEntity<List<Order>> - HTTP 200 OK with list of user's orders
     * 
     * FLOW:
     * 1. Frontend sends GET request with userId in URL path
     * 2. Method extracts userId from path variable
     * 3. Calls service to fetch orders from database
     * 4. Service returns list of Order entities
     * 5. Wraps list in ResponseEntity with 200 status → sends to frontend
     * 6. Frontend displays order history to user
     * 
     * WHAT HAPPENS NEXT:
     * - Frontend displays list of orders
     * - User can view order details, track status, etc.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<Order>> getOrdersByUser(@PathVariable Long userId) {
        // Call service to get all orders for this user
        // Returns: List of Order entities (empty list if user has no orders)
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }
}

