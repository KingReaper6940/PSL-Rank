export const SITE_URL = 'https://pslranked.com'
export const SITE_NAME = 'PSL Rank'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export function toAbsoluteUrl(path = '/') {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

