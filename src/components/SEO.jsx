// src/components/SEO.jsx
// ── Reusable SEO meta tag component ──────────────────────
// Usage: <SEO title="Products" description="Browse our collection" />
// Industry standard: every page should have unique title + description.
// Uses document.title directly (no extra library needed).

import { useEffect } from 'react'

const SITE_NAME    = 'SkinCare'
const SITE_URL     = 'https://skincare.com'
const DEFAULT_DESC = 'Premium AI-powered skincare. Discover your skin type and find clinically proven products made for you.'
const DEFAULT_IMG  = `${SITE_URL}/og-image.jpg`

export default function SEO({
  title,
  description = DEFAULT_DESC,
  image       = DEFAULT_IMG,
  url,
  type        = 'website',
  noIndex     = false,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} | Science-Backed Skincare`
  const fullUrl   = url ? `${SITE_URL}${url}` : SITE_URL

  useEffect(() => {
    // ── Page title ──
    document.title = fullTitle

    // ── Helper: set or create a meta tag ──
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=')
        el.setAttribute(attrName.trim(), attrVal.replace(/"/g, '').trim())
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    // ── Standard meta ──
    setMeta('meta[name="description"]',        'content', description)
    setMeta('meta[name="robots"]',             'content', noIndex ? 'noindex,nofollow' : 'index,follow')
    setMeta('meta[name="theme-color"]',        'content', '#FAF8F5')

    // ── Open Graph (Facebook, WhatsApp, LinkedIn) ──
    setMeta('meta[property="og:title"]',       'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:image"]',       'content', image)
    setMeta('meta[property="og:url"]',         'content', fullUrl)
    setMeta('meta[property="og:type"]',        'content', type)
    setMeta('meta[property="og:site_name"]',   'content', SITE_NAME)

    // ── Twitter Card ──
    setMeta('meta[name="twitter:card"]',        'content', 'summary_large_image')
    setMeta('meta[name="twitter:title"]',       'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', description)
    setMeta('meta[name="twitter:image"]',       'content', image)

    // ── Canonical URL ──
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', fullUrl)

  }, [fullTitle, description, image, fullUrl, type, noIndex])

  return null // renders nothing — only sets <head> tags
}