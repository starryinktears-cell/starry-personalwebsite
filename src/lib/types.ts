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
  storagePath?: string
  mimeType?: string
  error?: string
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
  sortOrder?: number
  coverAssetId?: string
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
  heroAssetId?: string | null
  heroAlt?: string
  content?: SiteContent
  accent: string
  theme?: { footerColor?: string; followHero?: boolean; defaultMode?: 'light' | 'dark'; light?: ThemePalette; dark?: ThemePalette; nightAtmosphere?: boolean; ambientMotion?: boolean; nightGlow?: string }
  socialLinks: { label: string; href: string }[]
}

export type SiteImage = { src: string; assetId?: string | null; alt: string }
export type ThemePalette = { background?: string; surface?: string; section?: string; footer?: string; accent?: string; glow?: string }
export type HeroSlide = { id: string; caseId?: string; visible: boolean }
export type SiteContent = {
  experienceItems?: { id: string }[]
  heroSlides?: HeroSlide[]
  customCases?: { id: string; name: string }[]
  texts: Record<string, { en: string; zh: string }>
  images: Record<string, SiteImage>
  videos?: Record<string, SiteImage>
}
