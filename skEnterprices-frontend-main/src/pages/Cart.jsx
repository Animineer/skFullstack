import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa'

/**
 * Cart Component - Displays shopping cart with all items and order summary
 * 
 * WHAT IT DOES:
 * - Shows all items currently in the shopping cart
 * - Allows users to increase/decrease item quantities
 * - Allows users to remove items from cart
 * - Displays order summary with subtotal, shipping, and total
 * - Provides button to proceed to checkout
 * 
 * FLOW:
 * 1. Component renders → gets cart items from CartContext
 * 2. If cart empty → shows empty cart message
 * 3. If cart has items → displays cart items and order summary
 * 4. User can modify quantities or remove items
 * 5. User clicks "Proceed to Checkout" → navigates to checkout page
 * 
 * RETURNS:
 * - JSX with cart items list and order summary sidebar
 */
const Cart = () => {
  // Get cart-related functions and data from CartContext
  // cartItems: array of products in cart with quantities
  // removeFromCart: function to remove a product from cart
  // updateQuantity: function to change quantity of a product
  // getCartTotal: function that returns total price of all items
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()
  
  // Navigation hook to programmatically navigate to different pages
  const navigate = useNavigate()

  /**
   * Early Return - Handles empty cart scenario
   * 
   * WHAT IT DOES:
   * - Checks if cart is empty (no items)
   * - If empty, shows empty cart message with link to products page
   * - Prevents rendering cart items and order summary
   * 
   * FLOW:
   * 1. Component renders → checks cartItems.length
   * 2. If length is 0 → returns early with empty cart UI
   * 3. If length > 0 → continues to render cart items below
   * 
   * WHAT HAPPENS NEXT:
   * - User sees empty cart message
   * - User can click "Continue Shopping" → goes to products page
   * - User can add products → cart updates → this component re-renders with items
   */
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart!</p>
        <Link
          to="/products"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }
  // If cart has items, continue rendering cart content below

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-indigo-600 font-bold text-xl">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <FaMinus />
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">$10.00</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ${(getCartTotal() + 10).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/products"
              className="block text-center mt-4 text-indigo-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

