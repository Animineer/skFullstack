import axios from 'axios'

/**
 * API Configuration File - Centralized API service for frontend-backend communication
 * 
 * WHAT IT DOES:
 * - Configures axios instance with base URL and default headers
 * - Provides service objects for different API endpoints (products, orders, auth, upload)
 * - Each service method returns a Promise that resolves to API response
 * 
 * FLOW:
 * 1. Frontend component calls service method (e.g., productService.getAll())
 * 2. Service method makes HTTP request to backend API
 * 3. Backend processes request and returns response
 * 4. Promise resolves with response data
 * 5. Component uses the data to update UI
 */

// Base URL for all API requests
// Points to Spring Boot backend running on port 8080
const API_URL = 'http://localhost:8080/api'

/**
 * Axios Instance - Pre-configured HTTP client
 * 
 * WHAT IT DOES:
 * - Creates axios instance with base URL and default headers
 * - All requests using this instance will automatically include these settings
 * 
 * RETURNS:
 * - Axios instance ready to make API calls
 */
const api = axios.create({
  baseURL: API_URL, // All requests will be prefixed with this URL
  headers: {
    'Content-Type': 'application/json', // Default content type for requests
  },
})

/**
 * Product Service - Handles all product-related API calls
 * 
 * WHAT IT DOES:
 * - Provides methods to interact with product endpoints
 * - Each method returns a Promise that resolves to response object
 * 
 * METHODS:
 * - getAll(): GET /api/products - Returns all products
 * - getById(id): GET /api/products/{id} - Returns single product by ID
 * - create(product): POST /api/products - Creates new product
 * - update(id, product): PUT /api/products/{id} - Updates existing product
 * - delete(id): DELETE /api/products/{id} - Deletes product by ID
 * 
 * RETURNS:
 * - Object with methods that return Promises
 */
export const productService = {
  /**
   * getAll - Fetches all products from backend
   * @returns {Promise} Resolves to response with data array of all products
   */
  // getAll accepts optional params: { search, category, sort, minPrice, maxPrice, page, size }
  getAll: (params) => api.get('/products', { params }),
  
  /**
   * getById - Fetches a single product by its ID
   * @param {number|string} id - Product ID
   * @returns {Promise} Resolves to response with single product object
   */
  getById: (id) => api.get(`/products/${id}`),
  
  /**
   * create - Creates a new product in the database
   * @param {Object} product - Product object with name, price, description, etc.
   * @returns {Promise} Resolves to response with created product
   */
  create: (product) => api.post('/products', product),
  
  /**
   * update - Updates an existing product
   * @param {number|string} id - Product ID to update
   * @param {Object} product - Updated product data
   * @returns {Promise} Resolves to response with updated product
   */
  update: (id, product) => api.put(`/products/${id}`, product),
  
  /**
   * delete - Deletes a product from database
   * @param {number|string} id - Product ID to delete
   * @returns {Promise} Resolves to empty response (204 No Content)
   */
  delete: (id) => api.delete(`/products/${id}`),
}

/**
 * Order Service - Handles all order-related API calls
 * 
 * WHAT IT DOES:
 * - Provides methods to create orders and fetch user orders
 * 
 * METHODS:
 * - create(order): POST /api/orders - Creates a new order
 * - getByUser(userId): GET /api/orders/user/{userId} - Gets all orders for a user
 */
export const orderService = {
  /**
   * create - Creates a new order in the database
   * @param {Object} order - Order object with items, total, shippingInfo
   * @returns {Promise} Resolves to response with created order
   */
  create: (order) => api.post('/orders', order),
  
  /**
   * getByUser - Fetches all orders for a specific user
   * @param {number|string} userId - User ID
   * @returns {Promise} Resolves to response with array of user's orders
   */
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
}

/**
 * Auth Service - Handles authentication API calls
 * 
 * WHAT IT DOES:
 * - Provides methods for user login and registration
 */
export const authService = {
  /**
   * login - Authenticates a user and gets access token
   * @param {Object} credentials - Object with email and password
   * @returns {Promise} Resolves to response with token and user data
   */
  login: (credentials) => api.post('/auth/login', credentials),
  
  /**
   * register - Registers a new user account
   * @param {Object} userData - Object with name, email, password
   * @returns {Promise} Resolves to response with success message and user data
   */
  register: (userData) => api.post('/auth/register', userData),
}

/**
 * Admin Service - Handles admin-related API calls
 * 
 * WHAT IT DOES:
 * - Provides methods for admin to manage users and view statistics
 * 
 * METHODS:
 * - getStatistics(): GET /api/admin/statistics - Gets system statistics
 * - getAllUsers(): GET /api/admin/users - Gets all users in system
 * - createUser(user): POST /api/admin/users - Creates new user
 * - updateUserRole(userId, role): PUT /api/admin/users/{userId}/role - Updates user role
 * - deleteUser(userId): DELETE /api/admin/users/{userId} - Deletes user
 */
export const adminService = {
  getStatistics: () => api.get('/admin/statistics'),
  // getAllUsers accepts optional params: { search, role, sort, page, size }
  getAllUsers: (params) => api.get('/admin/users', { params }),
  createUser: (user) => api.post('/admin/users', user),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
}

/**
 * Seller Service - Handles seller-related API calls
 * 
 * WHAT IT DOES:
 * - Provides methods for sellers to manage products and view orders
 * 
 * METHODS:
 * - getStatistics(sellerId): GET /api/seller/statistics/{sellerId} - Gets seller statistics
 * - getProducts(sellerId): GET /api/seller/products/{sellerId} - Gets seller's products
 * - getOrders(sellerId): GET /api/seller/orders/{sellerId} - Gets seller's orders
 * - createProduct(product): POST /api/seller/products - Creates new product
 * - updateProduct(productId, product): PUT /api/seller/products/{productId} - Updates product
 * - deleteProduct(productId): DELETE /api/seller/products/{productId} - Deletes product
 */
export const sellerService = {
  getStatistics: (sellerId) => api.get('/seller/statistics', { params: { sellerId } }),
  // params can include search, sort, filters (e.g., status), pagination
  getProducts: (sellerId, params = {}) => api.get('/seller/products', { params: { sellerId, ...params } }),
  getOrders: (sellerId, params = {}) => api.get('/seller/orders', { params: { sellerId, ...params } }),
  // createProduct accepts product and sellerId and sends sellerId as request param
  createProduct: (product, sellerId) => api.post('/seller/products', product, { params: { sellerId } }),
  updateProduct: (productId, product, sellerId) => api.put(`/seller/products/${productId}`, product, { params: { sellerId } }),
  deleteProduct: (productId, sellerId) => api.delete(`/seller/products/${productId}`, { params: { sellerId } }),
}

/**
 * Upload Service - Handles file uploads to Cloudinary
 * 
 * WHAT IT DOES:
 * - Provides method to upload images to Cloudinary via backend
 */
export const uploadService = {
  /**
   * uploadImage - Uploads an image file to Cloudinary
   * 
   * WHAT IT DOES:
   * - Creates FormData object with the file
   * - Sends POST request to backend upload endpoint
   * - Backend uploads to Cloudinary and returns image URL
   * 
   * PARAMETERS:
   * @param {File} file - Image file object from file input
   * 
   * RETURNS:
   * @returns {Promise} Resolves to response with image URL
   * 
   * FLOW:
   * 1. Frontend calls uploadImage(file)
   * 2. Creates FormData and appends file
   * 3. Sends POST to /api/upload/image with multipart/form-data
   * 4. Backend receives file, uploads to Cloudinary
   * 5. Backend returns Cloudinary URL
   * 6. Promise resolves with URL → frontend can use it for product image
   * 
   * WHAT HAPPENS NEXT:
   * - Response contains image URL that can be saved with product
   * - Frontend can display the image or store URL in database
   */
  uploadImage: (file) => {
    // Create FormData object for multipart/form-data request
    const formData = new FormData()
    // Append the file with key 'file' (backend expects this key)
    formData.append('file', file)
    // Make POST request to upload endpoint
    // Uses axios directly (not api instance) because we need different Content-Type
    return axios.post(`${API_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads
      },
    })
  },
}

// Export the configured axios instance for direct use if needed
export default api

