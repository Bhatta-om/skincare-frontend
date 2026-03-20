// src/components/ErrorBoundary.jsx — SkinMedica Luxury Redesign
import React from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

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
        <div style={{
          minHeight: '100vh',
          background: '#FAF8F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 16px',
          fontFamily: "'DM Sans', 'Inter', sans-serif",
        }}>
          <div style={{ width: '100%', maxWidth: '480px' }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: '#16100C', letterSpacing: '0.04em' }}>
                SkinCare
              </span>
            </div>

            {/* Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E6DDD3', overflow: 'hidden' }}>

              {/* Red top accent */}
              <div style={{ height: '3px', background: '#963838' }} />

              <div style={{ padding: '48px 40px', textAlign: 'center' }}>

                {/* Icon */}
                <div style={{
                  width: '72px', height: '72px',
                  border: '1px solid #D8BEBE',
                  background: '#FCF3F3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 28px',
                }}>
                  <AlertTriangle size={28} strokeWidth={1.5} style={{ color: '#963838' }} />
                </div>

                {/* Eyebrow */}
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10.5px', textTransform: 'uppercase',
                  letterSpacing: '0.18em', color: '#963838',
                  marginBottom: '12px', fontWeight: 400,
                }}>
                  Something went wrong
                </p>

                {/* Heading */}
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '24px', color: '#16100C',
                  fontWeight: 400, marginBottom: '10px',
                }}>
                  Unexpected Error
                </h2>

                {/* Message */}
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13.5px', color: '#7B6458',
                  lineHeight: 1.7, fontWeight: 300, marginBottom: '28px',
                }}>
                  {this.state.error?.message || 'An unexpected error occurred. Please try refreshing or return to the homepage.'}
                </p>

                {/* Dev details */}
                {import.meta.env.DEV && (
                  <details style={{ marginBottom: '24px', textAlign: 'left' }}>
                    <summary style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px', textTransform: 'uppercase',
                      letterSpacing: '0.14em', color: '#963838',
                      cursor: 'pointer', fontWeight: 400,
                      padding: '8px 12px',
                      background: '#FCF3F3',
                      border: '1px solid #D8BEBE',
                      userSelect: 'none',
                    }}>
                      Developer Details
                    </summary>
                    <pre style={{
                      fontFamily: 'monospace',
                      fontSize: '11px', color: '#963838',
                      background: '#FDF8F8',
                      border: '1px solid #D8BEBE',
                      borderTop: 'none',
                      padding: '12px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '200px',
                      margin: 0,
                      lineHeight: 1.6,
                    }}>
                      {this.state.error?.stack}
                      {'\n\nComponent Stack:\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    style={{
                      flex: 1,
                      background: '#16100C',
                      color: '#FAF8F5',
                      border: 'none',
                      padding: '13px 20px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px', fontWeight: 400,
                      textTransform: 'uppercase', letterSpacing: '0.14em',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#3A2820'}
                    onMouseLeave={e => e.currentTarget.style.background = '#16100C'}
                  >
                    <RotateCcw size={13} strokeWidth={1.5} />
                    Try Again
                  </button>

                  <button
                    onClick={() => { window.location.href = '/' }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      color: '#16100C',
                      border: '1px solid #E6DDD3',
                      padding: '13px 20px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px', fontWeight: 400,
                      textTransform: 'uppercase', letterSpacing: '0.14em',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#16100C'; e.currentTarget.style.color = '#FAF8F5'; e.currentTarget.style.borderColor = '#16100C' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#16100C'; e.currentTarget.style.borderColor = '#E6DDD3' }}
                  >
                    <Home size={13} strokeWidth={1.5} />
                    Go Home
                  </button>
                </div>
              </div>
            </div>

            {/* Help text */}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11.5px', color: '#AA9688',
              textAlign: 'center', marginTop: '20px', fontWeight: 300,
            }}>
              Persistent issue?{' '}
              <a href="mailto:support@skincare.com" style={{ color: '#B8895A', textDecoration: 'none' }}>
                Contact support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary