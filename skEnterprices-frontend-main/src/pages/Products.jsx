import { useEffect, useState } from 'react'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard'

/**
 * Products Component - Displays all products with search functionality
 * 
 * WHAT IT DOES:
 * - Fetches and displays all products from the database
 * - Provides a search bar to filter products by name or description
 * - Shows loading state while fetching
 * - Displays "No products found" if search returns no results
 * 
 * FLOW:
 * 1. Component mounts → fetches all products
 * 2. User types in search → filters products in real-time
 * 3. Displays filtered results in a grid
 * 
 * RETURNS:
 * - JSX with search bar and product grid
 */
const Products = () => {
  // State to store all products from the database
  // Initial: empty array, After API: full product list
  const [products, setProducts] = useState([])
  
  // State to track loading status
  // Initial: true (showing spinner), After API: false (showing products)
  const [loading, setLoading] = useState(true)
  
  // Query state for server-side search/sort/filter
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('') // e.g., 'price_asc', 'price_desc', 'name_asc'
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)

  /**
   * useEffect Hook #1 - Fetches all products on component mount
   * 
   * WHAT IT DOES:
   * - Makes API call to get all products from backend
   * - Stores products in state for filtering
   * - Initializes filteredProducts with all products
   * 
   * FLOW:
   * 1. Component mounts → this effect runs
   * 2. Calls productService.getAll() → GET /api/products
   * 3. If successful: stores all products, sets filteredProducts to all products
   * 4. Sets loading to false → component re-renders
   * 5. Products are displayed (or filtered if search term exists)
   * 
   * WHAT HAPPENS NEXT:
   * - Products are displayed in grid
   * - Second useEffect watches for search changes
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = {
          search: searchTerm || undefined,
          sort: sortBy || undefined,
          category: category || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page,
          size,
        }
        const response = await productService.getAll(params)
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search slightly
    const id = setTimeout(() => fetchProducts(), 300)
    return () => clearTimeout(id)
  }, [searchTerm, sortBy, category, minPrice, maxPrice, page, size])

  /**
   * useEffect Hook #2 - Filters products based on search term
   * 
   * WHAT IT DOES:
   * - Watches for changes in searchTerm or products array
   * - Filters products that match the search term (name or description)
   * - Updates filteredProducts state with matching products
   * 
   * FLOW:
   * 1. User types in search box → searchTerm state updates
   * 2. This effect detects change → runs filter logic
   * 3. Filters products array by checking if name/description contains search term
   * 4. Updates filteredProducts → component re-renders
   * 5. Grid displays only matching products
   * 
   * WHAT HAPPENS NEXT:
   * - If search term is empty: shows all products
   * - If search term matches: shows filtered products
   * - If no matches: shows "No products found" message
   */
  // products comes from server already filtered; show directly

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Products</h1>
      
      {/* Search & Filters */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:space-x-4 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
          <option value="name_desc">Name: Z → A</option>
        </select>
        <input type="text" placeholder="Category" value={category} onChange={(e)=>setCategory(e.target.value)} className="px-3 py-2 border rounded" />
        <input type="number" placeholder="Min price" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} className="px-3 py-2 border rounded" />
        <input type="number" placeholder="Max price" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} className="px-3 py-2 border rounded" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Products

