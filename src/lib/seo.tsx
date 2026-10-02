import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Project } from './types'

const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin

const upsertMeta = (name: string, content: string, property = false) => {
  const attr = property ? 'property' : 'name'
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, name)
    document.head.appendChild(element)
  }
  element.content = content
}

export function RouteMeta({ projects = [] }: { projects?: Project[] }) {
  const location = useLocation()
  useEffect(() => {
    const pathname = location.pathname
    const project = projects.find((item) => `/work/${item.slug}` === pathname && item.status === 'published')
    let title = 'Studio / 01 — Visual stories'
    let description = 'Photography, film and visual stories for a more conscious tomorrow.'
    let image = '/images/hero.webp'
    if (project) {
      title = `${project.title} — ${project.category}, ${project.location ?? 'Studio / 01'} ${project.year} | Studio / 01`
      description = project.summary
      image = project.cover
    } else if (pathname === '/') title = 'Studio / 01 — Visual stories for a more conscious tomorrow'
    else if (pathname === '/work') title = 'Selected work — Photography & film | Studio / 01'
    else if (pathname === '/about') title = 'About the studio | Studio / 01'
    else if (pathname === '/services') title = 'Creative services | Studio / 01'
    else if (pathname === '/contact') title = 'Let’s work together | Studio / 01'
    else if (pathname === '/privacy') title = 'Privacy | Studio / 01'
    else if (pathname.startsWith('/admin')) title = 'Private workspace | Studio / 01'
    else title = 'Out of focus | Studio / 01'

    document.title = title
    upsertMeta('description', description)
    upsertMeta('og:title', title, true)
    upsertMeta('og:description', description, true)
    upsertMeta('og:image', new URL(image, siteUrl).toString(), true)
    upsertMeta('og:url', new URL(pathname, siteUrl).toString(), true)
    upsertMeta('twitter:title', title)
    upsertMeta('twitter:description', description)
    upsertMeta('twitter:image', new URL(image, siteUrl).toString())

    const existing = document.getElementById('studio-jsonld')
    existing?.remove()
    const script = document.createElement('script')
    script.id = 'studio-jsonld'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(project ? { '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: project.summary, image: new URL(image, siteUrl).toString(), dateCreated: String(project.year), locationCreated: project.location } : { '@context': 'https://schema.org', '@type': 'Organization', name: 'Studio / 01', url: siteUrl, image: new URL('/images/hero.webp', siteUrl).toString() })
    document.head.appendChild(script)
  }, [location.pathname, projects])

  useEffect(() => {
    let activeTitle = document.title
    const onVisibility = () => { if (document.hidden) { activeTitle = document.title; document.title = '🎞 Come back to the story…' } else document.title = activeTitle }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  return null
}
