import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  /**
   * Handles input field changes and updates form state
   * @param e - Input change event
   */
  const handleChange = (e) => {
    // Update form data state with new value for the changed field
    // Uses computed property name to dynamically set the field based on input name
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /**
   * Handles form submission when user clicks register button
   * @param e - Form submit event
   */
  const handleSubmit = async (e) => {
    // Prevent default form submission behavior (page refresh)
    e.preventDefault()
    
    // Validate that password and confirm password fields match
    if (formData.password !== formData.confirmPassword) {
      // If passwords don't match, show error and stop registration
      toast.error('Passwords do not match!')
      return // Exit function early, don't proceed with registration
    }
    // If passwords match, continue with registration

    try {
      // Remove confirmPassword from formData before sending to backend
      // Backend doesn't need the confirmation field, only the actual password
      const { confirmPassword, ...userData } = formData
      // Call backend API to register the new user
      await authService.register(userData)
      // If registration successful, show success notification
      toast.success('Registration successful! Please login.')
      // Redirect user to login page to sign in with new account
      navigate('/login')
    } catch (error) {
      // If registration fails (email already exists, network error, etc.),
      // show error notification to the user
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
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
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register

