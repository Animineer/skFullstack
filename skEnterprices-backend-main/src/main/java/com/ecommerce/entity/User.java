package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * User Entity - Represents a user in the system with role-based access
 * 
 * WHAT IT DOES:
 * - Stores user account information (name, email, password)
 * - Defines user role (ADMIN, SELLER, USER) for access control
 * - Links to orders placed by the user
 * 
 * ROLES:
 * - ADMIN: Can manage all users and sellers, full system access
 * - SELLER: Can manage products, orders, and view statistics
 * - USER: Regular customer, can browse and place orders
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    /**
     * User role - Determines access level and permissions
     * Default: USER (regular customer)
     * Values: ADMIN, SELLER, USER
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    /**
     * UserRole Enum - Defines available user roles in the system
     */
    public enum UserRole {
        ADMIN,  // Full system access, manages users and sellers
        SELLER, // Manages products and orders, views statistics
        USER    // Regular customer, browses and places orders
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Order> orders = new ArrayList<>();
}

