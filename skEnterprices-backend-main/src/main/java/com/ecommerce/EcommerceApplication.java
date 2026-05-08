package com.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * EcommerceApplication - Main entry point for the Spring Boot application
 * 
 * WHAT IT DOES:
 * - Starts the Spring Boot application
 * - Initializes Spring context and all beans
 * - Starts embedded Tomcat server on port 8080
 * - Enables auto-configuration for Spring Boot features
 * 
 * FLOW:
 * 1. Application starts → main() method is called
 * 2. SpringApplication.run() initializes Spring context
 * 3. Spring scans for @Component, @Service, @Repository, @Controller annotations
 * 4. Creates and wires all beans (dependency injection)
 * 5. Starts embedded web server (Tomcat)
 * 6. Application is ready to receive HTTP requests
 * 
 * ANNOTATIONS:
 * - @SpringBootApplication: Combines:
 *   - @Configuration: Marks as configuration class
 *   - @EnableAutoConfiguration: Enables Spring Boot auto-configuration
 *   - @ComponentScan: Scans for components in this package and sub-packages
 */
@SpringBootApplication
public class EcommerceApplication {
    /**
     * main - Entry point of the application
     * 
     * WHAT IT DOES:
     * - Starts the Spring Boot application
     * - Initializes all Spring components and configurations
     * - Starts the embedded web server
     * 
     * PARAMETERS:
     * @param args - Command line arguments (not used in this application)
     * 
     * RETURNS:
     * @return void - Method doesn't return until application is stopped
     * 
     * FLOW:
     * 1. JVM calls main() method
     * 2. SpringApplication.run() is called with this class and args
     * 3. Spring Boot:
     *    - Reads application.properties for configuration
     *    - Scans for Spring components (@Service, @Controller, etc.)
     *    - Creates beans and performs dependency injection
     *    - Starts embedded Tomcat server on port 8080
     *    - Registers all REST controllers
     * 4. Application is running and ready to handle requests
     * 
     * WHAT HAPPENS NEXT:
     * - Server listens on http://localhost:8080
     * - API endpoints are available at /api/*
     * - Frontend can now make requests to the backend
     * - Application runs until stopped (Ctrl+C or shutdown)
     */
    public static void main(String[] args) {
        // Start Spring Boot application
        // This method:
        // - Creates Spring ApplicationContext
        // - Registers all @Component, @Service, @Repository, @Controller beans
        // - Starts embedded Tomcat server
        // - Makes application ready to handle HTTP requests
        SpringApplication.run(EcommerceApplication.class, args);
    }
}

