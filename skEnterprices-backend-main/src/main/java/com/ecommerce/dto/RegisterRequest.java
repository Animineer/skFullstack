package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RegisterRequest DTO - Data transfer object for user registration
 * 
 * WHAT IT DOES:
 * - Contains user registration data sent from frontend
 * - Used to create new user accounts
 * 
 * PARAMETERS:
 * - name: User's full name
 * - email: User's email address (must be unique)
 * - password: User's password (should be hashed in production)
 * - role: Optional user role (defaults to USER if not provided)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    /**
     * User role - Optional, defaults to USER
     * Only ADMIN can create accounts with ADMIN or SELLER role
     */
    private com.ecommerce.entity.User.UserRole role;
}

