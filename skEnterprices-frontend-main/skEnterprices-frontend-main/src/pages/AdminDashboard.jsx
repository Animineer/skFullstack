import { useEffect, useState } from 'react'
import { adminService } from '../services/api'
import { toast } from 'react-toastify'

/**
 * AdminDashboard Component - Admin control panel for managing users and sellers
 * 
 * WHAT IT DOES:
 * - Displays system statistics (total users, admins, sellers)
 * - Lists all users in the system
 * - Allows admin to create, update, and delete users
 * - Allows admin to change user roles
 * 
 * FLOW:
 * 1. Component mounts → fetches statistics and users
 * 2. Admin views statistics and user list
 * 3. Admin can create new users, change roles, or delete users
 * 4. Changes are saved to backend → UI updates
 * 
 * RETURNS:
 * - JSX with statistics cards, user management table, and action buttons
 */
const AdminDashboard = () => {
  // State to store system statistics
  // Initial: null, After API: object with counts
  const [statistics, setStatistics] = useState(null)
  
  // State to store all users in the system
  // Initial: empty array, After API: array of user objects
  const [users, setUsers] = useState([])
  
  // State to track loading status
  const [loading, setLoading] = useState(true)
  
  // State for create user form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  })
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [userSort, setUserSort] = useState('')

  /**
   * useEffect Hook - Fetches data when component mounts
   * 
   * WHAT IT DOES:
   * - Fetches system statistics
   * - Fetches all users
   * - Updates state with fetched data
   * 
   * FLOW:
   * 1. Component mounts → this effect runs
   * 2. Calls adminService.getStatistics() → gets stats
   * 3. Calls adminService.getAllUsers() → gets users
   * 4. Updates state → component re-renders with data
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          search: userSearch || undefined,
          role: userRoleFilter || undefined,
          sort: userSort || undefined,
        }
        const [statsResponse, usersResponse] = await Promise.all([
          adminService.getStatistics(),
          adminService.getAllUsers(params)
        ])
        setStatistics(statsResponse.data)
        setUsers(usersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    const id = setTimeout(() => fetchData(), 300)
    return () => clearTimeout(id)
  }, [userSearch, userRoleFilter, userSort])

  /**
   * handleCreateUser - Creates a new user account
   * 
   * WHAT IT DOES:
   * - Sends new user data to backend
   * - Creates user account with specified role
   * - Refreshes user list after creation
   * 
   * FLOW:
   * 1. Admin fills form and clicks create → this function runs
   * 2. Calls adminService.createUser() → sends POST request
   * 3. If successful: shows success message, refreshes user list, closes form
   * 4. If error: shows error message
   */
  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      // Create user through admin service
      await adminService.createUser(newUser)
      // Show success notification
      toast.success('User created successfully!')
      // Refresh user list
      const usersResponse = await adminService.getAllUsers()
      setUsers(usersResponse.data)
      // Reset form and close
      setNewUser({ name: '', email: '', password: '', role: 'USER' })
      setShowCreateForm(false)
    } catch (error) {
      // If creation fails, show error
      toast.error('Failed to create user: ' + (error.response?.data?.error || error.message))
    }
  }

  /**
   * handleUpdateRole - Updates a user's role
   * 
   * WHAT IT DOES:
   * - Changes user's role (e.g., USER to SELLER)
   * - Updates user in database
   * - Refreshes user list
   * 
   * PARAMETERS:
   * @param userId - ID of user to update
   * @param newRole - New role to assign (ADMIN, SELLER, USER)
   */
  const handleUpdateRole = async (userId, newRole) => {
    try {
      // Update user role through admin service
      await adminService.updateUserRole(userId, newRole)
      // Show success notification
      toast.success('User role updated!')
      // Refresh user list to show updated role
      const usersResponse = await adminService.getAllUsers()
      setUsers(usersResponse.data)
    } catch (error) {
      // If update fails, show error
      toast.error('Failed to update role: ' + (error.response?.data?.error || error.message))
    }
  }

  /**
   * handleDeleteUser - Deletes a user from the system
   * 
   * WHAT IT DOES:
   * - Removes user account permanently
   * - Refreshes user list after deletion
   * 
   * PARAMETERS:
   * @param userId - ID of user to delete
   */
  const handleDeleteUser = async (userId) => {
    // Confirm deletion before proceeding
    if (!window.confirm('Are you sure you want to delete this user?')) {
      // If user cancels, do nothing
      return
    }
    // If user confirms, proceed with deletion

    try {
      // Delete user through admin service
      await adminService.deleteUser(userId)
      // Show success notification
      toast.success('User deleted successfully!')
      // Refresh user list (remove deleted user)
      const usersResponse = await adminService.getAllUsers()
      setUsers(usersResponse.data)
    } catch (error) {
      // If deletion fails, show error
      toast.error('Failed to delete user: ' + (error.response?.data?.error || error.message))
    }
  }

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-indigo-600">{statistics.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Admins</h3>
            <p className="text-3xl font-bold text-red-600">{statistics.adminCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Sellers</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.sellerCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Regular Users</h3>
            <p className="text-3xl font-bold text-green-600">{statistics.userCount}</p>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {showCreateForm ? 'Cancel' : 'Create User'}
          </button>
        </div>

        {/* Search / filter / sort for users */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
          <input type="text" placeholder="Search users..." value={userSearch} onChange={(e)=>setUserSearch(e.target.value)} className="w-full md:w-1/3 px-3 py-2 border rounded" />
          <select value={userRoleFilter} onChange={(e)=>setUserRoleFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={userSort} onChange={(e)=>setUserSort(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Sort</option>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
            <option value="email_asc">Email A→Z</option>
          </select>
        </div>

        {/* Create User Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="USER">User</option>
                  <option value="SELLER">Seller</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Create User
            </button>
          </form>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="USER">User</option>
                      <option value="SELLER">Seller</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

