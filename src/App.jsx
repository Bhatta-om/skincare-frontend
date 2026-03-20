// src/App.jsx
import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import Navbar        from './components/Navbar'
import Footer        from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'

// ── Lazy pages ────────────────────────────────────────────
const Home           = lazy(() => import('./pages/Home'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const Products       = lazy(() => import('./pages/Products'))
const ProductDetail  = lazy(() => import('./pages/ProductDetail'))
const SkinAnalysis   = lazy(() => import('./pages/SkinAnalysis'))
const Cart           = lazy(() => import('./pages/Cart'))
const Checkout       = lazy(() => import('./pages/Checkout'))
const EsewaSuccess   = lazy(() => import('./pages/EsewaSuccess'))
const OrderHistory   = lazy(() => import('./pages/OrderHistory'))
const Profile        = lazy(() => import('./pages/Profile'))
const Wishlist       = lazy(() => import('./pages/Wishlist'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrders      = lazy(() => import('./pages/admin/AdminOrders'))
const AdminUsers       = lazy(() => import('./pages/admin/AdminUsers'))
const AdminProducts    = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductList = lazy(() => import('./pages/admin/AdminProductList'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminCategories  = lazy(() => import('./pages/admin/AdminCategories'))
const AdminBulkImport  = lazy(() => import('./pages/admin/AdminBulkImport'))
const AdminSkinAnalysis = lazy(() => import('./pages/admin/AdminSkinAnalysis'))

// ── Loaders ───────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5', flexDirection: 'column', gap: '16px' }}>
    <div style={{ width: '32px', height: '32px', border: '1.5px solid #E6DDD3', borderTopColor: '#B8895A', borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11px', color: '#AA9688', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 400 }}>Loading</p>
  </div>
)

const LuxuryLoader = () => (
  <div style={{ position: 'fixed', inset: 0, background: '#FAF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', zIndex: 9999 }}>
    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#16100C', letterSpacing: '0.08em' }}>SKINCARE</span>
    <div style={{ width: '36px', height: '36px', border: '1.5px solid #E6DDD3', borderTopColor: '#B8895A', borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
  </div>
)

const AdminLoader = () => (
  <div style={{ position: 'fixed', inset: 0, background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
    <div style={{ width: '36px', height: '36px', border: '1.5px solid #333333', borderTopColor: '#B8895A', borderRadius: '50%', animation: 'luxurySpinner 0.9s linear infinite' }} />
  </div>
)

// ── 404 ───────────────────────────────────────────────────
const NotFound = () => (
  <div style={{ minHeight: '70vh', background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
    <div style={{ textAlign: 'center', maxWidth: '480px' }}>
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(80px,15vw,120px)', color: '#E6DDD3', fontWeight: 400, lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.04em' }}>404</p>
      <div style={{ width: '40px', height: '1px', background: '#B8895A', margin: '0 auto 24px' }} />
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#16100C', fontWeight: 400, marginBottom: '12px' }}>Page Not Found</h1>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: '#7B6458', lineHeight: 1.7, fontWeight: 300, marginBottom: '36px' }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.14em', background: '#16100C', color: '#FAF8F5', padding: '13px 32px', textDecoration: 'none' }}>Go Home</a>
        <a href="/products" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '11.5px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.14em', background: 'transparent', color: '#16100C', border: '1px solid #16100C', padding: '13px 32px', textDecoration: 'none' }}>Browse Products</a>
      </div>
    </div>
  </div>
)

// ── Helpers ───────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LuxuryLoader />
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading)        return <AdminLoader />
  if (!user)          return <Navigate to="/login" replace />
  if (!user.is_staff) return <Navigate to="/" replace />
  return children
}

const UserLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </main>
    <Footer />
  </>
)

const toastOptions = {
  duration: 3000,
  style: { fontFamily: "'DM Sans','Inter',sans-serif", fontSize: '13px', fontWeight: 300, background: '#16100C', color: '#FAF8F5', borderLeft: '3px solid #B8895A', borderRadius: 0, padding: '14px 20px', boxShadow: '0 8px 32px rgba(22,16,12,0.2)', letterSpacing: '0.01em', minWidth: '280px' },
  success: { style: { background: '#16100C', color: '#FAF8F5', borderLeft: '3px solid #4A7A57' }, iconTheme: { primary: '#4A7A57', secondary: '#FAF8F5' } },
  error:   { style: { background: '#16100C', color: '#FAF8F5', borderLeft: '3px solid #963838' }, iconTheme: { primary: '#963838', secondary: '#FAF8F5' } },
}

// ── Routes (must be inside BrowserRouter for useLocation) ─
function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="bottom-right" reverseOrder={false} toastOptions={toastOptions} />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>

          {/* ── Public ── */}
          <Route path="/"                      element={<UserLayout><Home /></UserLayout>} />
          <Route path="/login"                 element={<UserLayout><Login /></UserLayout>} />
          <Route path="/register"              element={<UserLayout><Register /></UserLayout>} />
          <Route path="/forgot-password"       element={<UserLayout><ForgotPassword /></UserLayout>} />
          <Route path="/skin-analysis"         element={<UserLayout><SkinAnalysis /></UserLayout>} />
          <Route path="/products"              element={<UserLayout><Products /></UserLayout>} />
          <Route path="/products/:slug"        element={<UserLayout><ProductDetail /></UserLayout>} />
          <Route path="/payment/esewa/success" element={<UserLayout><EsewaSuccess /></UserLayout>} />

          {/* ── Protected ── */}
          <Route path="/profile"  element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
          <Route path="/cart"     element={<ProtectedRoute><UserLayout><Cart /></UserLayout></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><UserLayout><Wishlist /></UserLayout></ProtectedRoute>} />
          <Route path="/orders"   element={<ProtectedRoute><UserLayout><OrderHistory /></UserLayout></ProtectedRoute>} />
          <Route path="/checkout" element={
            <ProtectedRoute><ErrorBoundary><UserLayout><Checkout /></UserLayout></ErrorBoundary></ProtectedRoute>
          } />

          {/* ── Admin ── */}
          <Route path="/admin"                     element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminDashboard /></Suspense></AdminRoute>} />
          <Route path="/admin/orders"              element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminOrders /></Suspense></AdminRoute>} />
          <Route path="/admin/users"               element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminUsers /></Suspense></AdminRoute>} />
          <Route path="/admin/products"            element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminProductList /></Suspense></AdminRoute>} />
          <Route path="/admin/products/stats"      element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminProducts /></Suspense></AdminRoute>} />
          <Route path="/admin/products/add"        element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminProductForm /></Suspense></AdminRoute>} />
          <Route path="/admin/products/edit/:slug" element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminProductForm /></Suspense></AdminRoute>} />
          <Route path="/admin/categories"          element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminCategories /></Suspense></AdminRoute>} />
          <Route path="/admin/bulk-import"         element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminBulkImport /></Suspense></AdminRoute>} />
          <Route path="/admin/skin-analysis"       element={<AdminRoute><Suspense fallback={<AdminLoader />}><AdminSkinAnalysis /></Suspense></AdminRoute>} />

          {/* ── 404 ── */}
          <Route path="*" element={<UserLayout><NotFound /></UserLayout>} />

        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}