import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /**
   * Handles form submission when user clicks login button
   * @param e - Form submit event
   */
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior (page refresh)
    e.preventDefault()
    try {
      // Attempt to login by calling the backend API with email and password
      const response = await authService.login(formData)
      // If login successful, store authentication token in browser's local storage
      // This token will be used for authenticated API requests
      localStorage.setItem('token', response.data.token)
      // Store user information in local storage as JSON string
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // Notify other parts of the app that auth changed (so CartContext can reload per-user cart)
      window.dispatchEvent(new Event('authChanged'))
      // Show success notification to the user
      toast.success('Login successful!')
      // Redirect user to the home page after successful login
      navigate('/')
    } catch (error) {
      // If login fails (wrong credentials or network error),
      // show error notification to the user
      toast.error('Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login

