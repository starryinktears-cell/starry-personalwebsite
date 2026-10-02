import type { Asset, Inquiry, Project, SiteSettings } from './types'

export const media = {
  coast: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1800&q=85',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85',
  portrait: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
  interior: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=85',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
  olive: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=85',
  shore: 'https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&w=1200&q=85',
  meadow: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85',
}

const asset = (id: string, src: string, alt: string, kind: 'image' | 'video' = 'image', extra: Partial<Asset> = {}): Asset => ({
  id, kind, name: `${id}.${kind === 'video' ? 'mp4' : 'jpg'}`, src, alt, status: 'ready', width: 1800, height: 1200, size: '4.8 MB', createdAt: '2026-09-26', ...extra,
})

export const projects: Project[] = [
  {
    id: 'p1', slug: 'northern-light', title: 'Northern Light', summary: 'A visual exploration of light, landscape, and stillness across the Arctic Circle.', body: 'A film about wild places and the people who keep returning. We travelled slowly, followed the weather and let the horizon write the edit.', year: 2026, category: 'Film', tags: ['nature', 'culture', 'humanity'], status: 'published', featured: true, location: 'Iceland', cover: media.mountain, coverAlt: 'A lone figure facing snow covered mountains', updatedAt: '2026-09-26', assets: [asset('aurora-lake', media.mountain, 'A lone figure facing a snow covered mountain range'), asset('coastline', media.coast, 'Black sand coastline under low cloud'), asset('aurora-reel', media.shore, 'Coastline at dusk', 'video', { poster: media.shore, duration: '00:24' }), asset('wind-portrait', media.portrait, 'Portrait in a wool scarf')],
  },
  {
    id: 'p2', slug: 'stillness', title: 'Stillness', summary: 'A photographic essay about quiet rooms, soft light, and the space between moments.', body: 'An ongoing study in presence. Each frame is made with natural light and a little more time than usual.', year: 2025, category: 'Photography', tags: ['portrait', 'editorial'], status: 'published', featured: true, location: 'Shanghai', cover: media.portrait, coverAlt: 'Portrait lit by a warm window', updatedAt: '2026-09-18', assets: [asset('stillness-01', media.portrait, 'Portrait in warm window light'), asset('stillness-02', media.interior, 'Quiet interior with a chair'), asset('stillness-03', media.olive, 'Olive branches in afternoon light')],
  },
  {
    id: 'p3', slug: 'field-notes', title: 'Field Notes', summary: 'Images from the road: small rituals, long afternoons, and places that stay with us.', body: 'A collection of commissioned and personal work made between assignments.', year: 2024, category: 'Brand', tags: ['travel', 'brand'], status: 'published', featured: false, location: 'Mediterranean', cover: media.coast, coverAlt: 'A calm rocky coastline in golden light', updatedAt: '2026-09-10', assets: [asset('field-01', media.coast, 'Rocky coastline in golden light'), asset('field-02', media.camera, 'Camera on a sunlit table'), asset('field-03', media.meadow, 'Path through a coastal meadow')],
  },
  {
    id: 'p4', slug: 'quiet-spaces', title: 'Quiet Spaces', summary: 'A visual language for a new kind of hospitality.', body: 'Draft project ready for final selects.', year: 2026, category: 'Interior', tags: ['brand', 'interior'], status: 'draft', featured: false, cover: media.interior, coverAlt: '', updatedAt: '2026-09-28', assets: [asset('quiet-01', media.interior, '', 'image', { status: 'processing' })],
  },
]

export const inquiries: Inquiry[] = [
  { id: 'i1', name: 'Maya Chen', email: 'maya@chencreative.co', projectType: 'Photography', message: 'We are looking for a thoughtful visual story for a new boutique hotel in Kyoto.', status: 'unread', createdAt: '2026-09-28T10:24:00+08:00' },
  { id: 'i2', name: 'Northline Studio', email: 'hello@northline.studio', projectType: 'Brand film', message: 'A collaboration opportunity for our next campaign.', status: 'unread', createdAt: '2026-09-26T16:17:00+08:00' },
  { id: 'i3', name: 'Jon Bell', email: 'jon@example.com', projectType: 'Editorial', message: 'Editorial project inquiry for a print feature.', status: 'read', createdAt: '2026-09-22T11:03:00+08:00' },
  { id: 'i4', name: 'Elena Park', email: 'elena@example.com', projectType: 'Other', message: 'Personal project collaboration.', status: 'archived', createdAt: '2026-09-18T14:41:00+08:00' },
]

export const siteSettings: SiteSettings = {
  siteName: 'STUDIO / 01', shortBio: 'A visual studio exploring the intersection of design, culture and meaningful ideas.', contactEmail: 'hello@studio01.co', heroTitle: 'Visual stories for a more conscious tomorrow', heroSubtitle: 'Photography / Film / Stories', heroImage: media.coast, accent: '#626a4c', socialLinks: [{ label: 'Instagram', href: '#' }, { label: 'Vimeo', href: '#' }, { label: 'LinkedIn', href: '#' }],
}
