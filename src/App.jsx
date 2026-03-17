// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import ForgotPassword from './pages/ForgotPassword'
import ProductDetail  from './pages/ProductDetail'
import Wishlist       from './pages/Wishlist'

import Home         from './pages/Home'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Products     from './pages/Products'
import SkinAnalysis from './pages/SkinAnalysis'
import Cart         from './pages/Cart'
import Checkout     from './pages/Checkout'
import EsewaSuccess from './pages/EsewaSuccess'
import OrderHistory from './pages/OrderHistory'
import Profile      from './pages/Profile'
import Navbar       from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminOrders      from './pages/admin/AdminOrders'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminProducts    from './pages/admin/AdminProducts'
import AdminProductList from './pages/admin/AdminProductList'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminCategories  from './pages/admin/AdminCategories'
import AdminBulkImport from './pages/admin/AdminBulkImport'

// ── Guards ────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  )
  if (!user)          return <Navigate to="/login" />
  if (!user.is_staff) return <Navigate to="/" />
  return children
}

// ── App ───────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── User routes (with Navbar) ── */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/skin-analysis"  element={<SkinAnalysis />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/payment/esewa/success" element={<EsewaSuccess />} />

              {/* Protected routes */}
              <Route path="/cart"     element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/orders"   element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Checkout — ErrorBoundary wrap */}
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Checkout />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
            </Routes>
          </>
        } />

        {/* ── Admin routes ── */}
        <Route path="/admin"                     element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/orders"              element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users"               element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/products"            element={<AdminRoute><AdminProductList /></AdminRoute>} />
        <Route path="/admin/products/stats"      element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/products/add"        element={<AdminRoute><AdminProductForm /></AdminRoute>} />
        <Route path="/admin/products/edit/:slug" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
        <Route path="/admin/categories"          element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/bulk-import" element={<AdminRoute><AdminBulkImport /></AdminRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App