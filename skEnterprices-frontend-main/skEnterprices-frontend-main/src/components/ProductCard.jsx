import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'

/**
 * ProductCard Component - Displays a single product in a card format
 * 
 * WHAT IT DOES:
 * - Shows product image, name, description, and price
 * - Provides "Add to Cart" button
 * - Links to product detail page when clicked
 * - Handles adding product to cart
 * 
 * PARAMETERS:
 * @param {Object} product - Product object containing:
 *   - id: unique identifier
 *   - name: product name
 *   - description: product description
 *   - price: product price
 *   - imageUrl: URL of product image
 * 
 * FLOW:
 * 1. Component receives product prop → renders card
 * 2. User clicks "Add to Cart" → prevents navigation, adds to cart, shows toast
 * 3. User clicks card (not button) → navigates to product detail page
 * 
 * RETURNS:
 * - JSX with product card containing image, info, and add to cart button
 */
const ProductCard = ({ product }) => {
  // Get addToCart function from CartContext
  // This function adds the product to the shopping cart
  const { addToCart } = useCart()

  /**
   * handleAddToCart - Handles adding product to cart when button is clicked
   * 
   * WHAT IT DOES:
   * - Prevents default link navigation (since button is inside a Link)
   * - Adds the product to the shopping cart
   * - Shows success notification to user
   * 
   * PARAMETERS:
   * @param {Event} e - Click event object
   * 
   * FLOW:
   * 1. User clicks "Add to Cart" button → this function runs
   * 2. Prevents navigation to product detail page
   * 3. Calls addToCart(product) → updates cart state in context
   * 4. Shows success toast notification
   * 5. Cart icon in navbar updates with new count
   * 
   * WHAT HAPPENS NEXT:
   * - Product is added to cart (stored in CartContext state and localStorage)
   * - User can continue browsing or go to cart page
   */
  const handleAddToCart = (e) => {
    // Prevent the Link's default navigation behavior
    // Without this, clicking button would navigate to product detail page
    e.preventDefault()
    // Add product to cart (updates CartContext state)
    addToCart(product)
    // Show success notification to user
    toast.success('Product added to cart!')
  }

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-64 overflow-hidden">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-indigo-600">
              ${product.price}
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

