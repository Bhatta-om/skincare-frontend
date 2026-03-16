// src/api/axios.js
import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // localStorage र sessionStorage दुवैबाट token खोज्छ (Remember Me)
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original    = error.config
    const status      = error.response?.status
    const isLogin     = original?.url?.includes('/users/login/')
    const isRefresh   = original?.url?.includes('/users/token/refresh/')
    const isGoogle    = original?.url?.includes('/users/google/')

    // Login/Google/Refresh endpoints — interceptor नलगाउने
    if (isLogin || isGoogle || isRefresh) return Promise.reject(error)

    // ── Auto token refresh ─────────────────────────────────
    if (status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token')
        if (!refresh) throw new Error('No refresh token')

        const res = await axios.post(
          'http://127.0.0.1:8000/api/users/token/refresh/',
          { refresh }
        )

        // नयाँ access token save गर्नुस् (same storage मा)
        if (localStorage.getItem('refresh_token')) {
          localStorage.setItem('access_token', res.data.access)
        } else {
          sessionStorage.setItem('access_token', res.data.access)
        }

        original.headers.Authorization = `Bearer ${res.data.access}`
        return api(original)
      } catch {
        // Refresh पनि fail — logout गर्नुस्
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('remember_me')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')

        if (window.location.pathname !== '/login') {
          localStorage.setItem('redirect_after_login', window.location.pathname)
          toast.error('Session expired. Please login again.')
          setTimeout(() => { window.location.href = '/login' }, 1500)
        }
      }
    }

    // ── Global error toasts ────────────────────────────────
    if (status === 403) {
      toast.error('You do not have permission to do this.')
    } else if (status === 500) {
      toast.error('Server error. Please try again later.')
    } else if (status === 404 && !original?.url?.includes('/users/')) {
      // 404 — user endpoints मा आफ्नै error handling छ
      toast.error('Resource not found.')
    }

    return Promise.reject(error)
  }
)

export default api