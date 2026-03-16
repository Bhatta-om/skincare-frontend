// Shared helper for product image URLs — used on Home, Products, ProductDetail, Cart, etc.
// Backend may return full URL (when request context is set) or relative path (/media/... or products/...).

export const MEDIA_BASE = 'http://127.0.0.1:8000'

/**
 * Build full image URL from API value.
 * Accepts: full URL (http/https), path with leading slash (/media/...), or path without (products/...).
 * @param {string|null|undefined} value - Image URL or path from API
 * @returns {string|null} Full URL or null if no value
 */
export function getProductImageUrl(value) {
  if (!value) return null
  if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) return value
  const path = typeof value === 'string' && value.startsWith('/') ? value : `/media/${value}`
  return `${MEDIA_BASE}${path}`
}
