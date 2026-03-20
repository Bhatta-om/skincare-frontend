// src/components/SearchBox.jsx — SkinMedica Luxury Redesign
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { getProductImageUrl } from '../utils/productImage'
import {
  Search, X, Clock, ChevronRight, Package,
  Tag, Layers, ArrowRight, Loader,
} from 'lucide-react'

const RECENT_KEY  = 'skincare_recent_searches'
const MAX_RECENT  = 5
const DEBOUNCE_MS = 320
const MIN_CHARS   = 3

const getLocalRecent    = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] } }
const saveLocalRecent   = (q) => { if (!q?.trim() || q.trim().length < MIN_CHARS) return; const prev = getLocalRecent(); const updated = [q.trim(), ...prev.filter(r => r.toLowerCase() !== q.trim().toLowerCase())]; localStorage.setItem(RECENT_KEY, JSON.stringify(updated.slice(0, MAX_RECENT))) }
const removeLocalRecent = (q) => { localStorage.setItem(RECENT_KEY, JSON.stringify(getLocalRecent().filter(r => r !== q))) }
const clearLocalRecent  = () => localStorage.removeItem(RECENT_KEY)

const Highlight = ({ text, query, style = {} }) => {
  if (!query || !text) return <span style={style}>{text}</span>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex   = new RegExp(`(${escaped})`, 'gi')
  const parts   = text.split(regex)
  return (
    <span style={style}>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} style={{ background: '#EAD8C2', color: '#B8895A', fontWeight: 500, padding: '0 1px', fontStyle: 'normal' }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  )
}

const SectionHead = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px 6px' }}>
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#AA9688', fontWeight: 400 }}>
      {label}
    </span>
    <div style={{ flex: 1, height: '1px', background: '#EEE7DF' }} />
  </div>
)

const DropRow = ({ active, onClick, onMouseEnter, children }) => (
  <div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 16px', cursor: 'pointer',
      background: active ? '#FFFCF9' : 'transparent',
      borderLeft: active ? '2px solid #B8895A' : '2px solid transparent',
      transition: 'all 0.15s ease',
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.borderLeftColor = 'transparent'
    }}
  >
    {children}
  </div>
)

export default function SearchBox({
  variant      = 'navbar',
  placeholder  = 'Search products, brands...',
  initialValue = '',
  onSearch,
  autoFocus    = false,
  onClose,
}) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [query,       setQuery]       = useState(initialValue)
  const [suggestions, setSuggestions] = useState(null)
  const [recent,      setRecent]      = useState([])
  const [open,        setOpen]        = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)

  const inputRef    = useRef(null)
  const dropdownRef = useRef(null)
  const timerRef    = useRef(null)

  const loadRecent = useCallback(async () => {
    if (user) {
      try { const res = await api.get('/users/search-history/'); setRecent(res.data.history || []); return } catch {}
    }
    setRecent(getLocalRecent())
  }, [user])

  useEffect(() => { loadRecent() }, [loadRecent])
  useEffect(() => { setQuery(initialValue) }, [initialValue])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const saveSearch = useCallback(async (q) => {
    if (!q?.trim() || q.trim().length < MIN_CHARS) return
    if (user) {
      try { await api.post('/users/search-history/', { query: q.trim() }); await loadRecent(); return } catch {}
    }
    saveLocalRecent(q); setRecent(getLocalRecent())
  }, [user, loadRecent])

  const removeSearch = useCallback(async (q) => {
    if (user) {
      try { await api.delete(`/users/search-history/?q=${encodeURIComponent(q)}`); await loadRecent(); return } catch {}
    }
    removeLocalRecent(q); setRecent(getLocalRecent())
  }, [user, loadRecent])

  const clearHistory = useCallback(async () => {
    if (user) {
      try { await api.delete('/users/search-history/'); setRecent([]); return } catch {}
    }
    clearLocalRecent(); setRecent([])
  }, [user])

  const fetchSuggestions = useCallback((q) => {
    clearTimeout(timerRef.current)
    if (q.trim().length < MIN_CHARS) { setSuggestions(null); setLoading(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/products/search/suggestions/?q=${encodeURIComponent(q.trim())}`)
        setSuggestions(res.data)
      } catch { setSuggestions(null) }
      finally  { setLoading(false) }
    }, DEBOUNCE_MS)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val); setActiveIdx(-1); fetchSuggestions(val); setOpen(true)
  }

  const handleFocus = () => { loadRecent(); setOpen(true) }

  const submitSearch = useCallback((q) => {
    const trimmed = q?.trim()
    if (!trimmed) return
    saveSearch(trimmed); setOpen(false); setActiveIdx(-1); setQuery(trimmed)
    if (onSearch) onSearch(trimmed)
    else navigate(`/products?search=${encodeURIComponent(trimmed)}`)
    onClose?.()
  }, [navigate, onSearch, saveSearch, onClose])

  const handleItemClick = useCallback((item) => {
    saveSearch(item.label); setOpen(false); setActiveIdx(-1); setQuery(item.label)
    if (item.type === 'product')       navigate(`/products/${item.slug}`)
    else if (item.type === 'brand')    { if (onSearch) onSearch(item.label); else navigate(`/products?search=${encodeURIComponent(item.label)}`) }
    else if (item.type === 'category') { if (onSearch) onSearch(item.label); else navigate(`/products?category=${item.id}`) }
    else if (item.type === 'recent')   { if (onSearch) onSearch(item.label); else navigate(`/products?search=${encodeURIComponent(item.label)}`) }
    onClose?.()
  }, [navigate, onSearch, saveSearch, onClose])

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown')      { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, dropdownItems.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter')     { e.preventDefault(); if (activeIdx >= 0 && dropdownItems[activeIdx]) handleItemClick(dropdownItems[activeIdx]); else submitSearch(query) }
    else if (e.key === 'Escape')    { setOpen(false); setActiveIdx(-1); inputRef.current?.blur(); onClose?.() }
  }

  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false); setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dropdownItems = useMemo(() => {
    const items = []
    if (query.trim().length < MIN_CHARS) {
      recent.forEach(r => items.push({ type: 'recent', label: r }))
    } else if (suggestions) {
      suggestions.products.forEach(p   => items.push({ type: 'product',  label: p.name,  slug: p.slug, brand: p.brand, price: p.discounted_price, image: p.image }))
      suggestions.brands.forEach(b    => items.push({ type: 'brand',    label: b }))
      suggestions.categories.forEach(c => items.push({ type: 'category', label: c.name, id: c.id }))
    }
    return items
  }, [query, suggestions, recent])

  const trimmedQuery = query.trim()
  const showRecent   = open && trimmedQuery.length < MIN_CHARS && recent.length > 0
  const showResults  = open && trimmedQuery.length >= MIN_CHARS
  const hasResults   = suggestions && (suggestions.products.length > 0 || suggestions.brands.length > 0 || suggestions.categories.length > 0)
  const isOverlay    = variant === 'overlay'

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={e => { e.preventDefault(); submitSearch(query) }}>
        <div style={{ position: 'relative' }}>

          {!isOverlay && (
            <Search size={14} strokeWidth={1.5}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#AA9688', pointerEvents: 'none' }}
            />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 0,
              padding: isOverlay ? '4px 0' : '10px 36px 10px 38px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: isOverlay ? '18px' : '13px',
              color: '#16100C',
              background: 'transparent',
              outline: 'none',
              fontWeight: 300,
              letterSpacing: '0.01em',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={e => {
              handleFocus()
              if (!isOverlay) {
                e.target.style.borderColor = '#B8895A'
                e.target.style.boxShadow   = '0 0 0 3px rgba(184,137,90,0.10)'
              }
            }}
            onBlur={e => {
              if (!isOverlay) {
                e.target.style.borderColor = '#E6DDD3'
                e.target.style.boxShadow   = 'none'
              }
            }}
          />

          {!isOverlay && (
            <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              {loading ? (
                <Loader size={13} strokeWidth={1.5} style={{ color: '#B8895A', animation: 'luxurySpinner 0.9s linear infinite' }} />
              ) : query ? (
                <button type="button"
                  onClick={() => { setQuery(''); setSuggestions(null); setOpen(false); inputRef.current?.focus(); if (onSearch) onSearch('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4C4B0', display: 'flex', padding: 0, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#963838'}
                  onMouseLeave={e => e.currentTarget.style.color = '#D4C4B0'}
                >
                  <X size={13} strokeWidth={2} />
                </button>
              ) : null}
            </div>
          )}
        </div>
      </form>

      {open && (showRecent || showResults) && (
        <div ref={dropdownRef} style={{
          position: 'absolute',
          top: isOverlay ? 'calc(100% + 80px)' : 'calc(100% + 6px)',
          left: isOverlay ? '-40px' : 0,
          right: isOverlay ? '-40px' : 0,
          zIndex: 999,
          background: '#FFFFFF',
          border: '1px solid #E6DDD3',
          borderTop: '2px solid #B8895A',
          boxShadow: '0 16px 48px rgba(22,16,12,0.12)',
          maxHeight: '420px',
          overflowY: 'auto',
        }}>

          {open && trimmedQuery.length > 0 && trimmedQuery.length < MIN_CHARS && (
            <div style={{ padding: '12px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#AA9688', textAlign: 'center', fontWeight: 300 }}>
              Type {MIN_CHARS - trimmedQuery.length} more character{MIN_CHARS - trimmedQuery.length > 1 ? 's' : ''} to search
            </div>
          )}

          {showRecent && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={11} strokeWidth={1.5} style={{ color: '#AA9688' }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#AA9688', fontWeight: 400 }}>
                    Recent Searches
                  </span>
                </div>
                <button onClick={clearHistory}
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#D4C4B0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, transition: 'color 0.2s ease', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#963838'}
                  onMouseLeave={e => e.currentTarget.style.color = '#D4C4B0'}
                >
                  Clear all
                </button>
              </div>
              {recent.map((r, i) => (
                <DropRow key={r} active={activeIdx === i} onMouseEnter={() => setActiveIdx(i)} onClick={() => handleItemClick({ type: 'recent', label: r })}>
                  <Clock size={13} strokeWidth={1.5} style={{ color: '#D4C4B0', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#3A2820', flex: 1, fontWeight: 300 }}>{r}</span>
                  <button onClick={e => { e.stopPropagation(); removeSearch(r) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4C4B0', display: 'flex', padding: '2px', transition: 'color 0.2s ease' }}
                    onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = '#963838' }}
                    onMouseLeave={e => e.currentTarget.style.color = '#D4C4B0'}
                  >
                    <X size={11} strokeWidth={2} />
                  </button>
                </DropRow>
              ))}
              <div style={{ height: '1px', background: '#EEE7DF', margin: '4px 16px' }} />
            </>
          )}

          {showResults && (
            <>
              {loading && !hasResults && (
                <div style={{ padding: '16px' }}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div className="skeleton" style={{ width: '44px', height: '44px', flexShrink: 0 }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="skeleton" style={{ height: '12px', width: '70%' }} />
                        <div className="skeleton" style={{ height: '10px', width: '40%' }} />
                      </div>
                      <div className="skeleton" style={{ height: '12px', width: '50px', flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}

              {!loading && suggestions && !hasResults && (
                <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                  <Search size={28} strokeWidth={1} style={{ color: '#E6DDD3', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', color: '#16100C', fontWeight: 400, marginBottom: '6px' }}>
                    No results for "{trimmedQuery}"
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#AA9688', fontWeight: 300, marginBottom: '14px' }}>
                    Try different keywords or check spelling
                  </p>
                  <button onClick={() => submitSearch(query)}
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#B8895A', background: '#FFFCF9', border: '1px solid #E6DDD3', padding: '6px 16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400, transition: 'all 0.2s ease' }}>
                    Search anyway
                  </button>
                </div>
              )}

              {suggestions?.products?.length > 0 && (
                <>
                  <SectionHead label="Products" />
                  {suggestions.products.map((p, i) => (
                    <DropRow key={p.slug} active={activeIdx === i} onMouseEnter={() => setActiveIdx(i)} onClick={() => handleItemClick({ type: 'product', label: p.name, slug: p.slug })}>
                      <div style={{ width: '44px', height: '44px', background: '#F4EDE4', border: '1px solid #E6DDD3', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.image ? <img src={getProductImageUrl(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} strokeWidth={1} style={{ color: '#D4C4B0' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Highlight text={p.name} query={trimmedQuery} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#16100C', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }} />
                        <Highlight text={p.brand} query={trimmedQuery} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AA9688', display: 'block', fontWeight: 300 }} />
                      </div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#B8895A', flexShrink: 0, fontWeight: 400 }}>Rs. {p.discounted_price}</span>
                    </DropRow>
                  ))}
                </>
              )}

              {suggestions?.brands?.length > 0 && (
                <>
                  <div style={{ height: '1px', background: '#EEE7DF', margin: '4px 0' }} />
                  <SectionHead label="Brands" />
                  {suggestions.brands.map((b, i) => {
                    const idx = (suggestions?.products?.length || 0) + i
                    return (
                      <DropRow key={b} active={activeIdx === idx} onMouseEnter={() => setActiveIdx(idx)} onClick={() => handleItemClick({ type: 'brand', label: b })}>
                        <div style={{ width: '44px', height: '44px', background: '#FDFAF7', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', color: '#B8895A', fontWeight: 400 }}>{b[0]?.toUpperCase()}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Highlight text={b} query={trimmedQuery} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#16100C', display: 'block', fontWeight: 400 }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AA9688', fontWeight: 300 }}>Browse all products</span>
                        </div>
                        <ChevronRight size={13} strokeWidth={1.5} style={{ color: '#D4C4B0', flexShrink: 0 }} />
                      </DropRow>
                    )
                  })}
                </>
              )}

              {suggestions?.categories?.length > 0 && (
                <>
                  <div style={{ height: '1px', background: '#EEE7DF', margin: '4px 0' }} />
                  <SectionHead label="Categories" />
                  {suggestions.categories.map((c, i) => {
                    const idx = (suggestions?.products?.length || 0) + (suggestions?.brands?.length || 0) + i
                    return (
                      <DropRow key={c.id} active={activeIdx === idx} onMouseEnter={() => setActiveIdx(idx)} onClick={() => handleItemClick({ type: 'category', label: c.name, id: c.id })}>
                        <div style={{ width: '44px', height: '44px', background: '#FDFAF7', border: '1px solid #E6DDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Layers size={16} strokeWidth={1.5} style={{ color: '#B8895A' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Highlight text={c.name} query={trimmedQuery} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#16100C', display: 'block', fontWeight: 400 }} />
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#AA9688', fontWeight: 300 }}>Browse category</span>
                        </div>
                        <ChevronRight size={13} strokeWidth={1.5} style={{ color: '#D4C4B0', flexShrink: 0 }} />
                      </DropRow>
                    )
                  })}
                </>
              )}

              {hasResults && (
                <div style={{ borderTop: '1px solid #EEE7DF', padding: '12px 16px' }}>
                  <button onClick={() => submitSearch(query)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', color: '#B8895A', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 400, transition: 'color 0.2s ease', padding: '4px 0' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#A5773E'}
                    onMouseLeave={e => e.currentTarget.style.color = '#B8895A'}
                  >
                    <Search size={12} strokeWidth={1.5} />
                    View all results for "{trimmedQuery}"
                    <ArrowRight size={12} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}