package com.ecommerce.service;

import com.ecommerce.entity.User;
import com.ecommerce.entity.User.UserRole;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AdminService - Service for admin-specific operations
 * 
 * WHAT IT DOES:
 * - Manages users and sellers (create, update, delete, list)
 * - Provides user management functionality
 * - Only accessible by users with ADMIN role
 * 
 * FLOW:
 * 1. Admin makes request → Controller validates admin role
 * 2. Controller calls service method → Service performs operation
 * 3. Service updates database → Returns result to controller
 * 4. Controller sends response to frontend
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    /**
     * getAllUsers - Retrieves all users in the system
     * 
     * WHAT IT DOES:
     * - Fetches all users from database
     * - Returns list of all users (ADMIN, SELLER, USER)
     * 
     * RETURNS:
     * @return List<User> - All users in the system
     */
    public List<User> getAllUsers() {
        // Retrieve all users from database
        // Returns: List of all User entities
        return userRepository.findAll();
    }

    /**
     * getAllUsers - Retrieves users with filtering and sorting
     * 
     * WHAT IT DOES:
     * - Fetches users with optional search, role filter
     * - Applies sorting by name or email
     * 
     * PARAMETERS:
     * @param search - Search term for name/email
     * @param role - Filter by role (ADMIN, SELLER, USER)
     * @param sort - Sorting option: name_asc, name_desc, email_asc, email_desc
     * 
     * RETURNS:
     * @return List<User> - Filtered and sorted users
     */
    public List<User> getAllUsers(String search, String role, String sort) {
        // Get all users
        List<User> users = userRepository.findAll();
        
        // Apply search filter (name/email case-insensitive)
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            users = users.stream()
                .filter(u -> u.getName().toLowerCase().contains(searchLower) ||
                           (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)))
                .collect(Collectors.toList());
        }
        
        // Apply role filter
        if (role != null && !role.isEmpty()) {
            try {
                UserRole filterRole = UserRole.valueOf(role.toUpperCase());
                users = users.stream()
                    .filter(u -> u.getRole() == filterRole)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid role provided, ignore filter
            }
        }
        
        // Apply sorting
        if (sort != null && !sort.isEmpty()) {
            switch (sort) {
                case "name_asc": users.sort((a, b) -> a.getName().compareToIgnoreCase(b.getName())); break;
                case "name_desc": users.sort((a, b) -> b.getName().compareToIgnoreCase(a.getName())); break;
                case "email_asc": users.sort((a, b) -> {
                    String emailA = a.getEmail() != null ? a.getEmail() : "";
                    String emailB = b.getEmail() != null ? b.getEmail() : "";
                    return emailA.compareToIgnoreCase(emailB);
                }); break;
                case "email_desc": users.sort((a, b) -> {
                    String emailA = a.getEmail() != null ? a.getEmail() : "";
                    String emailB = b.getEmail() != null ? b.getEmail() : "";
                    return emailB.compareToIgnoreCase(emailA);
                }); break;
            }
        }
        
        return users;
    }

    /**
     * getUsersByRole - Retrieves users filtered by role
     * 
     * WHAT IT DOES:
     * - Fetches users with specific role (ADMIN, SELLER, or USER)
     * 
     * PARAMETERS:
     * @param role - UserRole enum (ADMIN, SELLER, USER)
     * 
     * RETURNS:
     * @return List<User> - Users with the specified role
     */
    public List<User> getUsersByRole(UserRole role) {
        // Filter users by role
        // Returns: List of users matching the role
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == role)
                .collect(Collectors.toList());
    }

    /**
     * createUser - Creates a new user (can be ADMIN, SELLER, or USER)
     * 
     * WHAT IT DOES:
     * - Creates a new user account with specified role
     * - Only ADMIN can create ADMIN or SELLER accounts
     * 
     * PARAMETERS:
     * @param name - User's name
     * @param email - User's email (must be unique)
     * @param password - User's password
     * @param role - User role (ADMIN, SELLER, USER)
     * 
     * RETURNS:
     * @return User - Created user entity
     * 
     * THROWS:
     * @throws RuntimeException if email already exists
     */
    @Transactional
    public User createUser(String name, String email, String password, UserRole role) {
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            // If email exists, throw exception and stop creation
            throw new RuntimeException("Email already exists");
        }
        // If email doesn't exist, create new user

        // Create new user entity
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // In production, hash the password
        user.setRole(role); // Set the specified role

        // Save user to database
        // After saving, user will have auto-generated ID
        return userRepository.save(user);
    }

    /**
     * updateUserRole - Updates a user's role
     * 
     * WHAT IT DOES:
     * - Changes user's role (e.g., promote USER to SELLER)
     * - Only ADMIN can change roles
     * 
     * PARAMETERS:
     * @param userId - ID of user to update
     * @param newRole - New role to assign
     * 
     * RETURNS:
     * @return User - Updated user entity
     * 
     * THROWS:
     * @throws RuntimeException if user not found
     */
    @Transactional
    public User updateUserRole(Long userId, UserRole newRole) {
        // Find user by ID
        User user = userRepository.findById(userId)
                // If user not found, throw exception
                .orElseThrow(() -> new RuntimeException("User not found"));
        // If user found, update role

        // Update user's role
        user.setRole(newRole);
        // Save updated user to database
        return userRepository.save(user);
    }

    /**
     * deleteUser - Deletes a user from the system
     * 
     * WHAT IT DOES:
     * - Removes user account from database
     * - Should be used carefully as it permanently deletes user data
     * 
     * PARAMETERS:
     * @param userId - ID of user to delete
     * 
     * THROWS:
     * @throws RuntimeException if user not found
     */
    @Transactional
    public void deleteUser(Long userId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            // If user doesn't exist, throw exception
            throw new RuntimeException("User not found");
        }
        // If user exists, delete from database
        userRepository.deleteById(userId);
    }

    /**
     * getStatistics - Gets system-wide statistics for admin dashboard
     * 
     * WHAT IT DOES:
     * - Calculates total users, sellers, admins
     * - Provides overview statistics
     * 
     * RETURNS:
     * @return Map<String, Object> - Statistics data
     */
    public Map<String, Object> getStatistics() {
        // Get all users
        List<User> allUsers = userRepository.findAll();
        
        // Calculate statistics
        long totalUsers = allUsers.size();
        long adminCount = allUsers.stream().filter(u -> u.getRole() == UserRole.ADMIN).count();
        long sellerCount = allUsers.stream().filter(u -> u.getRole() == UserRole.SELLER).count();
        long userCount = allUsers.stream().filter(u -> u.getRole() == UserRole.USER).count();

        // Create response map
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("adminCount", adminCount);
        stats.put("sellerCount", sellerCount);
        stats.put("userCount", userCount);
        
        // Return statistics
        return stats;
    }
}

