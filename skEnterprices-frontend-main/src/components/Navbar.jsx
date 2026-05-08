import { Link, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser } from 'react-icons/fa'
import { useCart } from '../context/CartContext'

/**
 * Navbar Component - Top navigation bar for the application
 * 
 * WHAT IT DOES:
 * - Displays the application logo/brand name
 * - Provides navigation links (Home, Products)
 * - Shows shopping cart icon with item count badge
 * - Shows user icon for login/account access
 * - Stays fixed at the top when scrolling
 * 
 * FLOW:
 * 1. Component renders → gets cart item count from context
 * 2. Displays navigation links and icons
 * 3. Cart badge shows count if > 0, hidden if 0
 * 4. User clicks links → navigates to different pages
 * 
 * RETURNS:
 * - JSX with navigation bar containing logo, links, and icons
 */
const Navbar = () => {
  // Get function to count total items in cart from CartContext
  // Returns: number representing total quantity of all items in cart
  const { getCartItemsCount } = useCart()

  // Get current user from localStorage to check role
  // Returns: user object with role property, or null if not logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const userRole = user?.role

  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // notify app about auth change so CartContext can reload
    window.dispatchEvent(new Event('authChanged'))
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">ShopHub</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 transition">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-indigo-600 transition">
              Products
            </Link>
            {/* Show Admin Dashboard link only if user is ADMIN */}
            {userRole === 'ADMIN' && (
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
                Admin Dashboard
              </Link>
            )}
            {/* Show Seller Dashboard link only if user is SELLER */}
            {userRole === 'SELLER' && (
              <Link to="/seller/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
                Seller Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Show cart icon for all users except ADMIN (sellers can also use the cart) */}
            {(userRole !== 'ADMIN') && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <FaShoppingCart className="text-xl" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Link>
            )}
            {/* Show user icon - links to login if not logged in, or shows user menu if logged in */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Logout
                </button>
                <Link to="/profile" className="p-2 text-gray-700 hover:text-indigo-600 transition">
                  <FaUser className="text-xl" />
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 text-gray-700 hover:text-indigo-600 transition"
              >
                <FaUser className="text-xl" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

