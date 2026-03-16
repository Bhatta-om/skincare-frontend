// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider }     from './context/AuthContext'
import { CartProvider }     from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  padding: '12px 16px',
                },
                success: {
                  style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
                  iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
                },
                error: {
                  style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
                  iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
                },
                loading: {
                  style: { background: '#faf5ff', color: '#6b21a8', border: '1px solid #e9d5ff' },
                },
              }}
            />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)