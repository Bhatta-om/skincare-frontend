// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

// ── helpers: remember-me aware storage ────────────────────
const saveTokens = (access, refresh, remember) => {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem('access_token',  access)
  storage.setItem('refresh_token', refresh)
  if (remember) {
    localStorage.setItem('remember_me', 'true')
  } else {
    localStorage.removeItem('remember_me')
  }
}

const getToken = (key) => {
  // Check localStorage first, then sessionStorage
  return localStorage.getItem(key) || sessionStorage.getItem(key) || null
}

const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('remember_me')
  sessionStorage.removeItem('access_token')
  sessionStorage.removeItem('refresh_token')
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user on app start
  useEffect(() => {
    const token = getToken('access_token')
    if (token) {
      api.get('/users/profile/')
        .then(res => setUser(res.data))
        .catch(() => {
          clearTokens()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // ── Normal login (email + password) ───────────────────────
  const login = async (email, password, rememberMe = false) => {
    const res = await api.post('/users/login/', { email, password })
    saveTokens(res.data.tokens.access, res.data.tokens.refresh, rememberMe)
    setUser(res.data.user)
    return res.data
  }

  // ── Google login ───────────────────────────────────────────
  // Google login always remembers (user chose to sign in with Google)
  const loginWithTokens = (access, refresh) => {
    saveTokens(access, refresh, true)
  }

  // ── Refresh user profile ───────────────────────────────────
  const refreshUser = async () => {
    try {
      const res = await api.get('/users/profile/')
      setUser(res.data)
    } catch {
      setUser(null)
    }
  }

  // ── Logout ─────────────────────────────────────────────────
  const logout = () => {
    clearTokens()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithTokens, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)