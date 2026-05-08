import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])

  // Helper to compute storage key based on logged-in user
  const getStorageKey = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      return user && user.id ? `cart_user_${user.id}` : 'cart_guest'
    } catch (e) {
      return 'cart_guest'
    }
  }

  const storageKeyRef = { key: getStorageKey() }

  /**
   * Loads cart items from browser's local storage when component first mounts
   * This persists cart data across page refreshes
   */
  useEffect(() => {
    // On mount, load cart for current user (per-user key)
    const loadCartFromStorage = () => {
      const key = getStorageKey()
      storageKeyRef.key = key
      // Migrate legacy 'cart' key if present and per-user key is empty
      try {
        const perUser = localStorage.getItem(key)
        if (!perUser) {
          const legacy = localStorage.getItem('cart')
          if (legacy) {
            localStorage.setItem(key, legacy)
            localStorage.removeItem('cart')
            setCartItems(JSON.parse(legacy))
            return
          }
        }
        if (perUser) {
          setCartItems(JSON.parse(perUser))
        } else {
          setCartItems([])
        }
      } catch (e) {
        setCartItems([])
      }
    }

    loadCartFromStorage()

    // Listen for auth changes (login/logout) and storage events from other tabs
    const onAuthChanged = () => loadCartFromStorage()
    const onStorage = (e) => {
      if (e.key === storageKeyRef.key || e.key === 'cart') loadCartFromStorage()
    }
    window.addEventListener('authChanged', onAuthChanged)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('authChanged', onAuthChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, []) // Empty dependency array means this runs only once on mount

  /**
   * Saves cart items to browser's local storage whenever cart changes
   * This automatically persists cart data whenever items are added/removed
   */
  useEffect(() => {
    // Save cart items to per-user storage key whenever cart changes
    try {
      const key = getStorageKey()
      storageKeyRef.key = key
      localStorage.setItem(key, JSON.stringify(cartItems))
    } catch (e) {
      // ignore storage errors
    }
  }, [cartItems]) // Runs whenever cartItems array changes

  /**
   * Adds a product to the shopping cart
   * If product already exists in cart, increases its quantity by 1
   * If product is new, adds it to cart with quantity 1
   * @param product - The product object to add to cart
   */
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Check if this product already exists in the cart
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        // If product already in cart, update its quantity
        // Map through all items and increment quantity for matching product
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 } // Increase quantity by 1
            : item // Keep other items unchanged
        )
      }
      // If product not in cart, add it as a new item with quantity 1
      return [...prevItems, { ...product, quantity: 1 }]
    })
  }

  /**
   * Removes a product from the shopping cart
   * @param productId - The ID of the product to remove
   */
  const removeFromCart = (productId) => {
    // Filter out the item with matching productId from the cart
    // All other items remain in the cart
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  /**
   * Updates the quantity of a specific product in the cart
   * @param productId - The ID of the product to update
   * @param quantity - The new quantity value
   */
  const updateQuantity = (productId, quantity) => {
    // Check if quantity is zero or negative
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item from cart completely
      removeFromCart(productId)
      return // Exit function early, item is removed
    }
    // If quantity is positive, update the item's quantity
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item // Update quantity for matching item
      )
    )
  }

  /**
   * Removes all items from the shopping cart
   * Typically called after successful order placement
   */
  const clearCart = () => {
    // Reset cart items to empty array
    setCartItems([])
  }

  /**
   * Calculates the total price of all items in the cart
   * @return Total price as a number (sum of price * quantity for all items)
   */
  const getCartTotal = () => {
    // Loop through all cart items
    // For each item, multiply price by quantity and add to running total
    // Start with 0 and accumulate the sum
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  /**
   * Counts the total number of items in the cart (sum of all quantities)
   * @return Total count of items (e.g., if cart has 2 of item A and 3 of item B, returns 5)
   */
  const getCartItemsCount = () => {
    // Loop through all cart items
    // Add up the quantity of each item to get total item count
    // Start with 0 and accumulate the count
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

