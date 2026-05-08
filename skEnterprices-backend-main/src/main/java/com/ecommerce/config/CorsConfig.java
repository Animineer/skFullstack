package com.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CorsConfig - Configuration class for Cross-Origin Resource Sharing (CORS)
 * 
 * WHAT IT DOES:
 * - Configures CORS policy to allow frontend (React) to make API requests
 * - Without this, browser would block requests from localhost:3000 to localhost:8080
 * - Enables communication between frontend and backend on different ports
 * 
 * FLOW:
 * 1. Frontend (localhost:3000) makes request to backend (localhost:8080)
 * 2. Browser checks CORS policy → sees this configuration
 * 3. If origin matches allowed origin → request proceeds
 * 4. If origin doesn't match → browser blocks request
 * 
 * WHY IT'S NEEDED:
 * - Frontend runs on port 3000, backend on port 8080
 * - Browsers enforce same-origin policy for security
 * - CORS allows cross-origin requests with proper configuration
 */
@Configuration
public class CorsConfig {

    /**
     * corsFilter - Creates CORS filter bean to handle cross-origin requests
     * 
     * WHAT IT DOES:
     * - Configures which origins (frontend URLs) are allowed
     * - Configures which HTTP methods are allowed (GET, POST, etc.)
     * - Configures which headers are allowed
     * - Applies configuration to all API endpoints
     * 
     * RETURNS:
     * @return CorsFilter - Filter that processes CORS headers on all requests
     * 
     * FLOW:
     * 1. Spring creates this filter during startup
     * 2. Filter intercepts all HTTP requests
     * 3. Checks if request origin is allowed (http://localhost:3000)
     * 4. If allowed → adds CORS headers to response → request proceeds
     * 5. If not allowed → browser blocks the request
     * 
     * WHAT HAPPENS NEXT:
     * - All API requests from frontend are allowed
     * - Browser receives CORS headers in response
     * - Frontend can successfully make API calls
     */
    @Bean
    public CorsFilter corsFilter() {
        // Create configuration source for CORS rules
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Create CORS configuration object
        CorsConfiguration config = new CorsConfiguration();
        // Allow sending credentials (cookies, auth headers) with requests
        config.setAllowCredentials(true);
        // Allow requests from React frontend running on localhost:3000
        config.addAllowedOrigin("http://localhost:3000");
        // Allow all headers in requests (Content-Type, Authorization, etc.)
        config.addAllowedHeader("*");
        // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        config.addAllowedMethod("*");
        // Apply this CORS configuration to all API endpoints (/**)
        source.registerCorsConfiguration("/**", config);
        // Return filter that will process CORS for all requests
        return new CorsFilter(source);
    }
}

