// src/pages/EsewaSuccess.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function EsewaSuccess() {
  const navigate = useNavigate()
  const [status, setStatus]   = useState('verifying') // verifying | success | failed
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        // Get data from URL
        const params  = new URLSearchParams(window.location.search)
        const data    = params.get('data')
        const orderId = localStorage.getItem('pending_order_id')

        if (!data || !orderId) {
          setStatus('failed')
          setMessage('Missing payment data. Please contact support.')
          return
        }

        // Verify with backend
        const res = await api.post('/payments/esewa/verify/', {
          data:     data,
          order_id: parseInt(orderId),
        })

        if (res.data.success) {
          localStorage.removeItem('pending_order_id')
          setStatus('success')
          setMessage(`Payment of Rs. ${res.data.payment?.amount} verified successfully!`)
          // Redirect to orders after 3 seconds
          setTimeout(() => navigate('/orders'), 3000)
        } else {
          setStatus('failed')
          setMessage(res.data.error || 'Payment verification failed.')
        }

      } catch (err) {
        setStatus('failed')
        setMessage(
          err.response?.data?.error ||
          'Payment verification failed. Please contact support.'
        )
      }
    }

    verify()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

        {/* Verifying */}
        {status === 'verifying' && (
          <div>
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="animate-spin h-10 w-10 text-purple-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment...</h2>
            <p className="text-gray-500">Please wait while we confirm your payment.</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-green-700 font-medium text-sm">
                🎉 Your order has been confirmed! Redirecting to orders...
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              View My Orders →
            </button>
          </div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <div>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
