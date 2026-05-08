package com.ecommerce.controller;

import com.ecommerce.dto.AuthRequest;
import com.ecommerce.dto.RegisterRequest;
import com.ecommerce.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * REST endpoint for user registration
     * Handles POST requests to /api/auth/register
     * @param request Contains registration data (name, email, password)
     * @return ResponseEntity with success response (201 Created) or error response (400 Bad Request)
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        try {
            // Attempt to register the user through the service layer
            Map<String, Object> response = authService.register(request);
            // If registration successful, return 201 Created status with user data
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // If registration fails (e.g., email already exists),
            // catch the exception and return 400 Bad Request with error message
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * REST endpoint for user login/authentication
     * Handles POST requests to /api/auth/login
     * @param request Contains login credentials (email, password)
     * @return ResponseEntity with success response (200 OK) or error response (401 Unauthorized)
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
        try {
            // Attempt to authenticate the user through the service layer
            Map<String, Object> response = authService.login(request);
            // If login successful, return 200 OK status with token and user data
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // If login fails (e.g., invalid email or password),
            // catch the exception and return 401 Unauthorized with error message
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

