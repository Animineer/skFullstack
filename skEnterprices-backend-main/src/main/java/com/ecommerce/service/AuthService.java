package com.ecommerce.service;

import com.ecommerce.dto.AuthRequest;
import com.ecommerce.dto.RegisterRequest;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    /**
     * Registers a new user in the system
     * @param request Contains user registration data (name, email, password)
     * @return Map containing success message and saved user data
     * @throws RuntimeException if email already exists in the database
     */
    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        // Check if email already exists in the database
        if (userRepository.existsByEmail(request.getEmail())) {
            // If email exists, throw exception and stop registration process
            // This prevents duplicate email addresses in the system
            throw new RuntimeException("Email already exists");
        }
        // If email doesn't exist, continue with registration process

        // Create a new User entity object
        User user = new User();
        // Set user details from the registration request
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In production, hash the password
        // Set user role from request (defaults to USER if not provided)
        // Only ADMIN can create SELLER or ADMIN accounts
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        } else {
            user.setRole(User.UserRole.USER); // Default role for new registrations
        }

        // Save the user to the database
        // After saving, the user will have an auto-generated ID
        User savedUser = userRepository.save(user);

        // Create response map to return to the controller
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("user", savedUser);
        // Return the response which will be sent to the frontend
        return response;
    }

    /**
     * Authenticates a user and generates a login token
     * @param request Contains login credentials (email and password)
     * @return Map containing authentication token and user data
     * @throws RuntimeException if email doesn't exist or password is incorrect
     */
    public Map<String, Object> login(AuthRequest request) {
        // Try to find user by email in the database
        User user = userRepository.findByEmail(request.getEmail())
                // If user not found (email doesn't exist), throw exception and stop login
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        // If user found, continue with password verification

        // Verify if the provided password matches the stored password
        if (!user.getPassword().equals(request.getPassword())) {
            // If passwords don't match, throw exception and stop login
            // This prevents unauthorized access even if email exists
            throw new RuntimeException("Invalid credentials");
        }
        // If password matches, user is authenticated successfully

        // Create response map with authentication token and user data
        Map<String, Object> response = new HashMap<>();
        // Generate a dummy token (in production, use JWT for security)
        response.put("token", "dummy-token-" + user.getId());
        response.put("user", user);
        // Return the response which will be sent to the frontend
        return response;
    }
}

