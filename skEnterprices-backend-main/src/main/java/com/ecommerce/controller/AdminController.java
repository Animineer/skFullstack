package com.ecommerce.controller;

import com.ecommerce.entity.User;
import com.ecommerce.entity.User.UserRole;
import com.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AdminController - REST Controller for admin operations
 * 
 * WHAT IT DOES:
 * - Handles HTTP requests for user and seller management
 * - Only accessible by users with ADMIN role
 * - Provides endpoints for managing the system
 * 
 * ENDPOINTS:
 * - GET /api/admin/users - Get all users
 * - GET /api/admin/users/role/{role} - Get users by role
 * - POST /api/admin/users - Create new user
 * - PUT /api/admin/users/{id}/role - Update user role
 * - DELETE /api/admin/users/{id} - Delete user
 * - GET /api/admin/statistics - Get system statistics
 * 
 * FLOW:
 * 1. Admin makes request → Controller receives it
 * 2. Controller calls service → Service performs operation
 * 3. Service returns result → Controller sends HTTP response
 * 4. Frontend receives response → Updates admin dashboard
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * getAllUsers - Gets all users in the system with optional filters
     * 
     * PARAMETERS:
     * @param search - Optional search term for name/email
     * @param role - Optional role filter (ADMIN, SELLER, USER)
     * @param sort - Optional sorting: name_asc, name_desc, email_asc, email_desc
     * 
     * RETURNS:
     * @return ResponseEntity<List<User>> - HTTP 200 OK with list of all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String sort) {
        // Get all users from service with optional filtering
        // If no filters provided, returns all users
        return ResponseEntity.ok(adminService.getAllUsers(search, role, sort));
    }

    /**
     * getUsersByRole - Gets users filtered by role
     * 
     * PARAMETERS:
     * @param role - UserRole enum (ADMIN, SELLER, USER)
     * 
     * RETURNS:
     * @return ResponseEntity<List<User>> - HTTP 200 OK with filtered users
     */
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable UserRole role) {
        // Get users with specific role
        // Returns: List of users matching the role
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }

    /**
     * createUser - Creates a new user account
     * 
     * PARAMETERS:
     * @param request - Map containing name, email, password, role
     * 
     * RETURNS:
     * @return ResponseEntity<User> - HTTP 201 Created with created user
     */
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody Map<String, Object> request) {
        // Extract user data from request
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        UserRole role = UserRole.valueOf(((String) request.get("role")).toUpperCase());
        
        // Create user through service
        User user = adminService.createUser(name, email, password, role);
        // Return created user with 201 status
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    /**
     * updateUserRole - Updates a user's role
     * 
     * PARAMETERS:
     * @param userId - ID of user to update
     * @param request - Map containing new role
     * 
     * RETURNS:
     * @return ResponseEntity<User> - HTTP 200 OK with updated user
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable("id") Long userId,
            @RequestBody Map<String, String> request) {
        // Extract new role from request
        UserRole newRole = UserRole.valueOf(request.get("role").toUpperCase());
        // Update user role through service
        User user = adminService.updateUserRole(userId, newRole);
        // Return updated user
        return ResponseEntity.ok(user);
    }

    /**
     * deleteUser - Deletes a user from the system
     * 
     * PARAMETERS:
     * @param userId - ID of user to delete
     * 
     * RETURNS:
     * @return ResponseEntity<Void> - HTTP 204 No Content
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long userId) {
        // Delete user through service
        adminService.deleteUser(userId);
        // Return 204 No Content status
        return ResponseEntity.noContent().build();
    }

    /**
     * getStatistics - Gets system-wide statistics
     * 
     * RETURNS:
     * @return ResponseEntity<Map<String, Object>> - HTTP 200 OK with statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        // Get statistics from service
        // Returns: Map with totalUsers, adminCount, sellerCount, userCount
        return ResponseEntity.ok(adminService.getStatistics());
    }
}

