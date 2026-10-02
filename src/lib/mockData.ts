import type { Inquiry, SiteSettings } from './types'
import { projects } from '../data/projects'

export { projects }

export const inquiries: Inquiry[] = [
  { id: 'i1', name: 'Maya Chen', email: 'maya@chencreative.co', projectType: 'Photography', message: 'We are looking for a thoughtful visual story for a new boutique hotel in Kyoto.', status: 'unread', createdAt: '2026-09-28T10:24:00+08:00' },
  { id: 'i2', name: 'Northline Studio', email: 'hello@northline.studio', projectType: 'Brand film', message: 'A collaboration opportunity for our next campaign.', status: 'unread', createdAt: '2026-09-26T16:17:00+08:00' },
  { id: 'i3', name: 'Jon Bell', email: 'jon@example.com', projectType: 'Editorial', message: 'Editorial project inquiry for a print feature.', status: 'read', createdAt: '2026-09-22T11:03:00+08:00' },
  { id: 'i4', name: 'Elena Park', email: 'elena@example.com', projectType: 'Other', message: 'Personal project collaboration.', status: 'archived', createdAt: '2026-09-18T14:41:00+08:00' },
]

export const siteSettings: SiteSettings = {
  siteName: 'STUDIO / 01',
  shortBio: 'A visual studio exploring the intersection of design, culture and meaningful ideas.',
  contactEmail: 'hello@studio01.co',
  heroTitle: 'Visual stories for a more conscious tomorrow',
  heroSubtitle: 'Photography / Film / Stories',
  heroImage: '/images/hero.webp',
  accent: '#626a4c',
  socialLinks: [{ label: 'Instagram', href: '#' }, { label: 'Vimeo', href: '#' }, { label: 'LinkedIn', href: '#' }],
}
