import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import SellerDashboard from './pages/SellerDashboard'

/**
 * App Component - Root component of the React application
 * 
 * WHAT IT DOES:
 * - Sets up routing for all pages in the application
 * - Provides CartContext to all child components
 * - Renders Navbar on all pages
 * - Configures toast notifications for user feedback
 * 
 * FLOW:
 * 1. Application starts → App component renders
 * 2. CartProvider wraps everything → provides cart state to all components
 * 3. Router enables client-side routing → handles URL changes
 * 4. Navbar renders on all pages → provides navigation
 * 5. Routes define which component renders for each URL path
 * 6. User navigates → Router matches URL → renders corresponding component
 * 
 * RETURNS:
 * - JSX with routing structure, navbar, and toast notifications
 */
function App() {
  return (
    // CartProvider wraps entire app to provide cart state to all components
    // All child components can access cart functions via useCart() hook
    <CartProvider>
      {/* Router enables client-side routing (no page refresh on navigation) */}
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navbar appears on all pages */}
          <Navbar />
          {/* Routes define URL paths and which component to render */}
          <Routes>
            {/* Home page - displays featured products */}
            <Route path="/" element={<Home />} />
            {/* Products page - displays all products with search */}
            <Route path="/products" element={<Products />} />
            {/* Product detail page - :id is a URL parameter (e.g., /product/123) */}
            <Route path="/product/:id" element={<ProductDetail />} />
            {/* Shopping cart page - displays cart items */}
            <Route path="/cart" element={<Cart />} />
            {/* Checkout page - order placement form */}
            <Route path="/checkout" element={<Checkout />} />
            {/* Login page - user authentication */}
            <Route path="/login" element={<Login />} />
            {/* Register page - new user registration */}
            <Route path="/register" element={<Register />} />
            {/* Admin dashboard - only accessible by ADMIN role */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* Seller dashboard - only accessible by SELLER role */}
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
          </Routes>
          {/* ToastContainer displays notification messages (success, error, etc.) */}
          {/* position: where notifications appear, autoClose: auto-hide after 3 seconds */}
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </CartProvider>
  )
}

export default App

