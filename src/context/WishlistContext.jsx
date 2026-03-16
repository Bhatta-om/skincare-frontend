// src/context/WishlistContext.jsx
// Industry standard: Global wishlist state — like cart context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext({})

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [wishlistIds, setWishlistIds] = useState([])   // lightweight IDs for UI
  const [loading,     setLoading]     = useState(false)

  // Fetch wishlist IDs on login
  const fetchWishlistIds = useCallback(async () => {
    if (!user) { setWishlistIds([]); return }
    try {
      const res = await api.get('/products/wishlist/ids/')
      setWishlistIds(res.data.ids || [])
    } catch {
      setWishlistIds([])
    }
  }, [user])

  useEffect(() => { fetchWishlistIds() }, [fetchWishlistIds])

  // Toggle — add or remove
  const toggleWishlist = useCallback(async (productId, productName = 'Product') => {
    if (!user) {
      toast.error('Please login to save to wishlist!')
      return false
    }
    const wasWishlisted = wishlistIds.includes(productId)

    // Optimistic UI update
    setWishlistIds(prev =>
      wasWishlisted ? prev.filter(id => id !== productId) : [...prev, productId]
    )

    try {
      const res = await api.post('/products/wishlist/toggle/', { product_id: productId })
      if (res.data.action === 'added') {
        toast.success(`❤️ Added to wishlist!`)
      } else {
        toast.success(`💔 Removed from wishlist`)
      }
      return res.data.wishlisted
    } catch (err) {
      // Rollback on error
      setWishlistIds(prev =>
        wasWishlisted ? [...prev, productId] : prev.filter(id => id !== productId)
      )
      toast.error('Failed to update wishlist.')
      return wasWishlisted
    }
  }, [user, wishlistIds])

  const isWishlisted = useCallback(
    (productId) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted, fetchWishlistIds, loading }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)