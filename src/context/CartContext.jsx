// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0)

  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setCartCount(0); return }
    try {
      const res  = await api.get('/orders/cart/')
      const data = res.data?.cart || res.data
      setCartCount(data?.total_items || data?.items?.length || 0)
    } catch {
      setCartCount(0)
    }
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)