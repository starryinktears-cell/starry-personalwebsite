export type ProjectStatus = 'draft' | 'published' | 'archived'
export type AssetKind = 'image' | 'video'
export type AssetStatus = 'uploading' | 'uploaded' | 'processing' | 'ready' | 'failed' | 'cancelled'

export type Asset = {
  id: string
  kind: AssetKind
  name: string
  src: string
  poster?: string
  alt: string
  status: AssetStatus
  width: number
  height: number
  duration?: string
  size: string
  createdAt: string
}

export type Project = {
  id: string
  slug: string
  title: string
  summary: string
  body: string
  year: number
  category: string
  tags: string[]
  status: ProjectStatus
  featured: boolean
  location?: string
  client?: string
  cover: string
  coverAlt: string
  coverLqip?: string
  coverSrcSet?: string
  coords?: string
  camera?: string
  format?: string
  credits?: string
  assets: Asset[]
  updatedAt: string
}

export type Inquiry = {
  id: string
  name: string
  email: string
  projectType: string
  message: string
  status: 'unread' | 'read' | 'archived'
  createdAt: string
  note?: string
}

export type SiteSettings = {
  siteName: string
  shortBio: string
  contactEmail: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  accent: string
  socialLinks: { label: string; href: string }[]
}
