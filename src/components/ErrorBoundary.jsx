// src/components/ErrorBoundary.jsx
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-lg w-full">
            <div className="text-5xl mb-4 text-center">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm text-center mb-4">{this.state.error?.message}</p>

            {/* ── Dev mode: show full error ── */}
            {import.meta.env.DEV && (
              <details className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <summary className="text-red-600 text-xs font-medium cursor-pointer">
                  Developer Details
                </summary>
                <pre className="text-red-500 text-xs mt-2 overflow-auto whitespace-pre-wrap">
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-medium text-sm">
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'}
                className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl font-medium text-sm">
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary