import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard'

/**
 * Home Component - Landing page of the e-commerce application
 * 
 * WHAT IT DOES:
 * - Displays a hero section with welcome message
 * - Fetches and displays the first 8 products as featured products
 * - Shows loading spinner while fetching data
 * 
 * FLOW:
 * 1. Component mounts → useEffect runs
 * 2. Fetches all products from backend API
 * 3. Takes first 8 products and stores in state
 * 4. Sets loading to false → renders products
 * 
 * RETURNS:
 * - JSX containing hero section and featured products grid
 */
const Home = () => {
  // State to store the list of featured products
  // Initial value: empty array []
  // After API call: array of product objects
  const [products, setProducts] = useState([])
  
  // State to track if data is still being loaded
  // Initial value: true (showing loading spinner)
  // After API call: false (showing products)
  const [loading, setLoading] = useState(true)

  /**
   * useEffect Hook - Runs when component first mounts
   * 
   * WHAT IT DOES:
   * - Fetches all products from the backend API
   * - Takes only the first 8 products for featured display
   * - Handles loading state and errors
   * 
   * FLOW:
   * 1. Component mounts → this effect runs once (empty dependency array)
   * 2. Calls productService.getAll() → sends GET request to /api/products
   * 3. If successful: extracts first 8 products, updates state, sets loading to false
   * 4. If error: logs error, sets loading to false (no products shown)
   * 5. Component re-renders with new state → displays products or empty state
   * 
   * WHAT HAPPENS NEXT:
   * - After products are loaded, they are displayed in a grid
   * - Each product is rendered using ProductCard component
   * - User can click on products to view details or add to cart
   */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Call backend API to get all products
        // Returns: Promise that resolves to response object with data array
        const response = await productService.getAll()
        // Extract first 8 products from the response
        // slice(0, 8) takes elements at index 0-7 (8 products total)
        // Updates products state → triggers re-render
        setProducts(response.data.slice(0, 8))
      } catch (error) {
        // If API call fails (network error, server error, etc.)
        // Log error for debugging
        console.error('Error fetching products:', error)
        // Products array remains empty, but loading stops
      } finally {
        // Always execute: whether success or error
        // Stops showing loading spinner
        setLoading(false)
        // Component re-renders → shows products (if any) or empty state
      }
    }
    // Execute the async function immediately
    fetchProducts()
  }, []) // Empty array means this runs only once when component mounts

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to ShopHub</h1>
          <p className="text-xl mb-8">Discover amazing products at great prices</p>
          <Link
            to="/products"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Products</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home

