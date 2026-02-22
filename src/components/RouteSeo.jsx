import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from '../lib/siteMeta'

function upsertMeta(attr, key, content) {
  if (!content) return

  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  if (!href) return

  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function RouteSeo({
  title,
  description,
  path,
  robots = 'index,follow',
  ogTitle,
  ogDescription,
  image = DEFAULT_OG_IMAGE,
}) {
  const location = useLocation()

  useEffect(() => {
    const currentPath = path || location.pathname || '/'
    const canonical = toAbsoluteUrl(currentPath)
    const resolvedTitle = title || 'PSL Rank'
    const resolvedDescription =
      description ||
      'Vote on matchups, track leaderboard movement, and explore the PSL Rank ranking system.'

    document.title = resolvedTitle

    upsertMeta('name', 'description', resolvedDescription)
    upsertMeta('name', 'robots', robots)
    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:title', ogTitle || resolvedTitle)
    upsertMeta('property', 'og:description', ogDescription || resolvedDescription)
    upsertMeta('property', 'og:image', image)

    // Match the project’s existing tag style (using `property` for twitter tags).
    upsertMeta('property', 'twitter:card', 'summary_large_image')
    upsertMeta('property', 'twitter:url', canonical)
    upsertMeta('property', 'twitter:title', ogTitle || resolvedTitle)
    upsertMeta('property', 'twitter:description', ogDescription || resolvedDescription)
    upsertMeta('property', 'twitter:image', image)
  }, [
    description,
    image,
    location.pathname,
    ogDescription,
    ogTitle,
    path,
    robots,
    title,
  ])

  return null
}

