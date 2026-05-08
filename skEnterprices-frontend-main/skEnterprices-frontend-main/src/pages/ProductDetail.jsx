import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/api'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  /**
   * Fetches product details from the backend when component mounts or product ID changes
   * Runs automatically when the component first loads or when the URL parameter changes
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Call backend API to get product details by ID
        const response = await productService.getById(id)
        // If product found, store it in state to display on the page
        setProduct(response.data)
      } catch (error) {
        // If product not found or API call fails,
        // log error for debugging
        console.error('Error fetching product:', error)
        // Show error notification to the user
        toast.error('Product not found')
        // Redirect user back to products list page
        navigate('/products')
      } finally {
        // Always set loading to false after API call completes
        // This ensures loading spinner is hidden whether request succeeds or fails
        setLoading(false)
      }
    }
    // Execute the fetch function
    fetchProduct()
  }, [id, navigate]) // Re-run this effect if product ID or navigate function changes

  /**
   * Handles adding product to cart when user clicks "Add to Cart" button
   * Adds the product multiple times based on selected quantity
   */
  const handleAddToCart = () => {
    // Loop through and add product to cart for each quantity selected
    // If quantity is 3, product will be added 3 times (quantity will be 3 in cart)
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    // Show success notification with the quantity added
    toast.success(`${quantity} item(s) added to cart!`)
  }

  // Check if product data is still being loaded from the API
  if (loading) {
    // If still loading, show loading spinner instead of product details
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  // If loading is complete, continue to check if product exists

  // Check if product data was successfully loaded
  if (!product) {
    // If product is null/undefined (not found or error occurred),
    // don't render anything (user will be redirected by useEffect)
    return null
  }
  // If product exists, render the product details below

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-indigo-600 mb-6">${product.price}</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Quantity</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                -
              </button>
              <span className="text-xl font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mb-4"
          >
            Add to Cart
          </button>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

