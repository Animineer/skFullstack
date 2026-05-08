import { useEffect, useState } from 'react'
import { sellerService, uploadService } from '../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

/**
 * SellerDashboard Component - Seller control panel for managing products and orders
 * 
 * WHAT IT DOES:
 * - Displays seller statistics (products, orders, revenue)
 * - Lists seller's products with edit/delete options
 * - Lists orders containing seller's products
 * - Allows seller to create new products
 * - Shows low stock alerts
 * 
 * FLOW:
 * 1. Component mounts → fetches statistics, products, and orders
 * 2. Seller views dashboard with business metrics
 * 3. Seller can manage products and view orders
 * 4. Changes are saved to backend → UI updates
 * 
 * RETURNS:
 * - JSX with statistics, product management, and order list
 */
const SellerDashboard = () => {
  const navigate = useNavigate()
  
  // Get seller ID from localStorage (set after login)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const sellerId = user.id

  // State to store seller statistics
  const [statistics, setStatistics] = useState(null)
  
  // State to store seller's products
  const [products, setProducts] = useState([])
  
  // State to store seller's orders
  const [orders, setOrders] = useState([])
  
  // State to track loading status
  const [loading, setLoading] = useState(true)

  // Product query/filter state
  const [prodSearch, setProdSearch] = useState('')
  const [prodSort, setProdSort] = useState('')
  const [prodCategory, setProdCategory] = useState('')
  const [prodMinPrice, setProdMinPrice] = useState('')
  const [prodMaxPrice, setProdMaxPrice] = useState('')

  // Orders query/filter state
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [orderSort, setOrderSort] = useState('')
  
  // State for create product form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stockQuantity: 0,
    category: ''
  })
  // image handling: either upload a local file or paste an external URL
  const [imageMode, setImageMode] = useState('url') // 'url' or 'file'
  const [imageFile, setImageFile] = useState(null)
  const [editingProductId, setEditingProductId] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [editImageMode, setEditImageMode] = useState('url')
  const [editImageFile, setEditImageFile] = useState(null)

  /**
   * useEffect Hook - Fetches data when component mounts
   * 
   * WHAT IT DOES:
   * - Fetches seller statistics
   * - Fetches seller's products
   * - Fetches seller's orders
   * - Updates state with fetched data
   * 
   * FLOW:
   * 1. Component mounts → this effect runs
   * 2. Calls sellerService methods with sellerId
   * 3. Updates state → component re-renders with data
   */
  useEffect(() => {
    // Check if user is logged in and is a seller
    if (!sellerId) {
      // If not logged in, redirect to login
      navigate('/login')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const prodParams = {
          search: prodSearch || undefined,
          sort: prodSort || undefined,
          category: prodCategory || undefined,
          minPrice: prodMinPrice || undefined,
          maxPrice: prodMaxPrice || undefined,
        }
        const orderParams = {
          search: orderSearch || undefined,
          status: orderStatus || undefined,
          sort: orderSort || undefined,
        }
        // Fetch stats, products, and orders (products/orders use query params)
        const [statsResponse, productsResponse, ordersResponse] = await Promise.all([
          sellerService.getStatistics(sellerId),
          sellerService.getProducts(sellerId, prodParams),
          sellerService.getOrders(sellerId, orderParams)
        ])
        setStatistics(statsResponse.data)
        setProducts(productsResponse.data)
        setOrders(ordersResponse.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Show backend error message if available for easier debugging
        const serverMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message
        toast.error('Failed to load dashboard data: ' + serverMsg)
      } finally {
        setLoading(false)
      }
    }

    // Debounce fetch to avoid rapid requests when user types
    const id = setTimeout(() => fetchData(), 300)
    return () => clearTimeout(id)
  }, [sellerId, navigate])

  /**
   * handleCreateProduct - Creates a new product for the seller
   * 
   * WHAT IT DOES:
   * - Sends new product data to backend
   * - Creates product linked to seller
   * - Refreshes product list after creation
   */
  const handleCreateProduct = async (e) => {
    e.preventDefault()
    try {
      // If uploading file, validate and upload to Cloudinary first
      let productToCreate = { ...newProduct }
      if (imageMode === 'file' && imageFile) {
        // Validate file format
        const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff']
        if (!validFormats.includes(imageFile.type)) {
          toast.error('Invalid image format. Supported: JPG, PNG, GIF, WebP, BMP, TIFF')
          return
        }
        // Validate file size (5MB max)
        if (imageFile.size > 5 * 1024 * 1024) {
          toast.error('File size exceeds 5MB limit')
          return
        }
        
        const uploadResp = await uploadService.uploadImage(imageFile)
        // backend returns { url }
        if (uploadResp.data?.error) {
          toast.error('Image upload failed: ' + uploadResp.data.error)
          return
        }
        productToCreate.imageUrl = uploadResp.data?.url || ''
      }
      // Convert price to number
      productToCreate.price = parseFloat(productToCreate.price)
      // Create product through seller service (sends sellerId as query param)
      await sellerService.createProduct(productToCreate, sellerId)
      // Show success notification
      toast.success('Product created successfully!')
      // Refresh product list
      const productsResponse = await sellerService.getProducts(sellerId)
      setProducts(productsResponse.data)
      // Reset form and close
      setNewProduct({ name: '', description: '', price: '', imageUrl: '', stockQuantity: 0, category: '' })
      setShowCreateForm(false)
      setImageFile(null)
      setImageMode('url')
    } catch (error) {
      // If creation fails, show error
      toast.error('Failed to create product: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleEditClick = (product) => {
    setEditingProductId(product.id)
    setEditProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
      category: product.category
    })
    setEditImageMode('url')
    setEditImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setShowCreateForm(true)
  }

  const handleCancelEdit = () => {
    setEditingProductId(null)
    setEditProduct(null)
    setEditImageFile(null)
    setShowCreateForm(false)
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      let productToUpdate = { ...editProduct }
      if (editImageMode === 'file' && editImageFile) {
        // Validate file format
        const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff']
        if (!validFormats.includes(editImageFile.type)) {
          toast.error('Invalid image format. Supported: JPG, PNG, GIF, WebP, BMP, TIFF')
          return
        }
        // Validate file size (5MB max)
        if (editImageFile.size > 5 * 1024 * 1024) {
          toast.error('File size exceeds 5MB limit')
          return
        }
        
        const uploadResp = await uploadService.uploadImage(editImageFile)
        // Check for upload errors
        if (uploadResp.data?.error) {
          toast.error('Image upload failed: ' + uploadResp.data.error)
          return
        }
        productToUpdate.imageUrl = uploadResp.data?.url || ''
      }
      // Convert price to number
      productToUpdate.price = parseFloat(productToUpdate.price)
      await sellerService.updateProduct(editingProductId, productToUpdate, sellerId)
      toast.success('Product updated successfully!')
      const productsResponse = await sellerService.getProducts(sellerId)
      setProducts(productsResponse.data)
      handleCancelEdit()
    } catch (error) {
      toast.error('Failed to update product: ' + (error.response?.data?.error || error.message))
    }
  }

  /**
   * handleDeleteProduct - Deletes a product
   * 
   * WHAT IT DOES:
   * - Removes product from database
   * - Refreshes product list after deletion
   * 
   * PARAMETERS:
   * @param productId - ID of product to delete
   */
  const handleDeleteProduct = async (productId) => {
    // Confirm deletion before proceeding
    if (!window.confirm('Are you sure you want to delete this product?')) {
      // If seller cancels, do nothing
      return
    }
    // If seller confirms, proceed with deletion

    try {
      // Delete product through seller service
      await sellerService.deleteProduct(productId, sellerId)
      // Show success notification
      toast.success('Product deleted successfully!')
      // Refresh product list (remove deleted product)
      const productsResponse = await sellerService.getProducts(sellerId)
      setProducts(productsResponse.data)
    } catch (error) {
      // If deletion fails, show error
      toast.error('Failed to delete product: ' + (error.response?.data?.error || error.message))
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Seller Dashboard</h1>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-indigo-600">{statistics.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${statistics.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">Low Stock</h3>
            <p className="text-3xl font-bold text-red-600">{statistics.lowStockProducts}</p>
          </div>
        </div>
      )}

      {/* Product Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {showCreateForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Product search / filter / sort */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-2 mb-4">
          <input type="text" placeholder="Search my products..." value={prodSearch} onChange={(e)=>setProdSearch(e.target.value)} className="w-full md:w-1/3 px-3 py-2 border rounded" />
          <select value={prodSort} onChange={(e)=>setProdSort(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Sort</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
          </select>
          <input type="text" placeholder="Category" value={prodCategory} onChange={(e)=>setProdCategory(e.target.value)} className="px-3 py-2 border rounded" />
          <input type="number" placeholder="Min" value={prodMinPrice} onChange={(e)=>setProdMinPrice(e.target.value)} className="px-3 py-2 border rounded w-24" />
          <input type="number" placeholder="Max" value={prodMaxPrice} onChange={(e)=>setProdMaxPrice(e.target.value)} className="px-3 py-2 border rounded w-24" />
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <form onSubmit={editingProductId ? handleUpdateProduct : handleCreateProduct} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProductId ? (editProduct?.name || '') : newProduct.name}
                  onChange={(e) => editingProductId ? setEditProduct({ ...editProduct, name: e.target.value }) : setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProductId ? (editProduct?.price || '') : newProduct.price}
                  onChange={(e) => editingProductId ? setEditProduct({ ...editProduct, price: e.target.value }) : setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  value={editingProductId ? (editProduct?.description || '') : newProduct.description}
                  onChange={(e) => editingProductId ? setEditProduct({ ...editProduct, description: e.target.value }) : setNewProduct({ ...newProduct, description: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Image URL</label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="imageMode"
                        value="url"
                        checked={editingProductId ? editImageMode === 'url' : imageMode === 'url'}
                        onChange={() => editingProductId ? setEditImageMode('url') : setImageMode('url')}
                        className="mr-2"
                      />
                      Use URL
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="imageMode"
                        value="file"
                        checked={editingProductId ? editImageMode === 'file' : imageMode === 'file'}
                        onChange={() => editingProductId ? setEditImageMode('file') : setImageMode('file')}
                        className="mr-2"
                      />
                      Upload File
                    </label>
                  </div>
                  {editingProductId ? (
                    editImageMode === 'url' ? (
                      <input
                        type="url"
                        value={editProduct?.imageUrl || ''}
                        onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
                          onChange={(e) => setEditImageFile(e.target.files[0])}
                          className="w-full mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, GIF, WebP, BMP, TIFF (Max 5MB)</p>
                      </div>
                    )
                  ) : (
                    imageMode === 'url' ? (
                      <input
                        type="url"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
                          onChange={(e) => setImageFile(e.target.files[0])}
                          className="w-full mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, GIF, WebP, BMP, TIFF (Max 5MB)</p>
                      </div>
                    )
                  )}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProductId ? (editProduct?.stockQuantity || 0) : newProduct.stockQuantity}
                  onChange={(e) => editingProductId ? setEditProduct({ ...editProduct, stockQuantity: parseInt(e.target.value) }) : setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value) })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                <input
                  type="text"
                  value={editingProductId ? (editProduct?.category || '') : newProduct.category}
                  onChange={(e) => editingProductId ? setEditProduct({ ...editProduct, category: e.target.value }) : setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {editingProductId ? 'Update Product' : 'Create Product'}
              </button>
              {editingProductId && (
                <button type="button" onClick={handleCancelEdit} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
              )}
            </div>
          </form>
        )}

        {/* Products List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/200'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-indigo-600 font-bold mb-2">${product.price}</p>
              <p className="text-sm text-gray-600 mb-2">Stock: {product.stockQuantity}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(product)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 gap-2">
          <input type="text" placeholder="Search orders..." value={orderSearch} onChange={(e)=>setOrderSearch(e.target.value)} className="w-full md:w-1/3 px-3 py-2 border rounded" />
          <select value={orderStatus} onChange={(e)=>setOrderStatus(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select value={orderSort} onChange={(e)=>setOrderSort(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Sort</option>
            <option value="date_desc">Date ↓</option>
            <option value="date_asc">Date ↑</option>
            <option value="total_desc">Total ↓</option>
            <option value="total_asc">Total ↑</option>
          </select>
        </div>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-indigo-600">${order.total?.toFixed(2)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold">{order.status}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard

