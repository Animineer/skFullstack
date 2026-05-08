package com.ecommerce.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * CloudinaryConfig - Configuration class for Cloudinary integration
 * 
 * WHAT IT DOES:
 * - Reads Cloudinary credentials from application.properties
 * - Creates and configures Cloudinary client bean
 * - Makes Cloudinary client available for dependency injection
 * 
 * FLOW:
 * 1. Spring Boot starts → reads application.properties
 * 2. @Value annotations inject property values into fields
 * 3. @Bean method creates Cloudinary client with credentials
 * 4. Cloudinary bean is registered in Spring context
 * 5. Other services can inject and use Cloudinary client
 * 
 * CONFIGURATION:
 * - cloudinary.cloud-name: Your Cloudinary cloud name
 * - cloudinary.api-key: Your Cloudinary API key
 * - cloudinary.api-secret: Your Cloudinary API secret
 */
@Configuration
public class CloudinaryConfig {
    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);

    /**
     * Cloud name from Cloudinary account
     * Injected from application.properties: cloudinary.cloud-name
     */
    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    /**
     * API key for Cloudinary authentication
     * Injected from application.properties: cloudinary.api-key
     */
    @Value("${cloudinary.api-key}")
    private String apiKey;

    /**
     * API secret for Cloudinary authentication
     * Injected from application.properties: cloudinary.api-secret
     */
    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * cloudinary - Creates and configures Cloudinary client bean
     * 
     * WHAT IT DOES:
     * - Creates a Cloudinary client instance with credentials
     * - Configures client to connect to your Cloudinary account
     * - Registers bean in Spring context for dependency injection
     * 
     * RETURNS:
     * @return Cloudinary - Configured Cloudinary client ready to use
     * 
     * FLOW:
     * 1. Spring calls this method during application startup
     * 2. Reads credentials from injected fields (from application.properties)
     * 3. Creates Cloudinary object with credentials map
     * 4. Returns configured client → Spring registers it as a bean
     * 5. CloudinaryService can now inject and use this client
     * 
     * WHAT HAPPENS NEXT:
     * - Cloudinary client is available throughout the application
     * - CloudinaryService injects this bean
     * - Image uploads can now be performed using this client
     */
    @Bean
    public Cloudinary cloudinary() {
        // Validate that API secret is configured (not a placeholder)
        if (apiSecret == null || apiSecret.trim().isEmpty()) {
            log.warn("Cloudinary API secret is not configured. Image uploads will not work.");
            // For testing purposes, create a dummy Cloudinary client
            return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName != null ? cloudName : "demo",
                "api_key", apiKey != null ? apiKey : "demo",
                "api_secret", "demo"
            ));
        }
        // Create Cloudinary client with credentials
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));
    }
}

