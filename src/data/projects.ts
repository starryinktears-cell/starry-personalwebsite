import type { Asset, Project } from '../lib/types'

type ImageKey = 'mountain' | 'coastline' | 'dusk' | 'portrait' | 'interior' | 'window' | 'olive' | 'field' | 'forest' | 'camera' | 'studio' | 'hands' | 'mountainLake' | 'meadow' | 'road' | 'desert' | 'shore' | 'wave'

const image = (key: ImageKey, alt: string) => ({
  src: `/images/${key}.webp`,
  poster: `/images/${key}.webp`,
  lqip: `/images/${key}-lqip.jpg`,
  srcSet: `/images/${key}-900.webp 900w, /images/${key}.webp 1800w`,
  alt,
  width: 1800,
  height: 1200,
})

const asset = (id: string, key: ImageKey, alt: string, kind: Asset['kind'] = 'image', extra: Partial<Asset> = {}): Asset => ({
  id,
  kind,
  name: `${id}.${kind === 'video' ? 'mp4' : 'webp'}`,
  src: image(key, alt).src,
  poster: image(key, alt).poster,
  alt,
  status: 'ready',
  width: 1800,
  height: 1200,
  size: kind === 'video' ? '28 MB' : '1.2 MB',
  createdAt: '2026-09-26',
  ...extra,
})

export const projects: Project[] = [
  {
    id: 'p1', slug: 'northern-light', title: 'Northern Light', summary: 'A visual exploration of light, landscape, and stillness across the Arctic Circle.', body: 'A film about wild places and the people who keep returning. We travelled slowly, followed the weather and let the horizon write the edit.', year: 2026, category: 'Film', tags: ['nature', 'culture', 'humanity'], status: 'published', featured: true, location: 'Iceland', client: 'Northline Studio', coords: 'N 64°08′ · W 21°56′', camera: 'ARRI Alexa Mini LF', format: '16 mm / 4K', credits: 'Director / Alex Rivera · Cinematography / Mei Lin', cover: image('mountain', 'A lone figure facing snow covered mountains').src, coverAlt: 'A lone figure facing snow covered mountains', coverLqip: image('mountain', '').lqip, coverSrcSet: image('mountain', '').srcSet, updatedAt: '2026-09-26', assets: [asset('northern-coast', 'coastline', 'Black sand coastline under low cloud'), asset('northern-reel', 'dusk', 'Aurora over a quiet mountain range', 'video', { poster: image('dusk', '').poster, duration: '00:24' })],
  },
  {
    id: 'p2', slug: 'stillness', title: 'Stillness', summary: 'A photographic essay about quiet rooms, soft light, and the space between moments.', body: 'An ongoing study in presence. Each frame is made with natural light and a little more time than usual.', year: 2025, category: 'Photography', tags: ['portrait', 'editorial'], status: 'published', featured: true, location: 'Shenzhen', client: 'Personal study', coords: 'N 22°33′ · E 114°03′', camera: 'Leica M11', format: 'Digital stills', credits: 'Photographer / Alex Rivera · Styling / Hana Ito', cover: image('portrait', 'Portrait lit by a warm window').src, coverAlt: 'Portrait lit by a warm window', coverLqip: image('portrait', '').lqip, coverSrcSet: image('portrait', '').srcSet, updatedAt: '2026-09-18', assets: [asset('stillness-room', 'interior', 'A quiet room with a chair'), asset('stillness-window', 'window', 'Mountain light through a studio window')],
  },
  {
    id: 'p3', slug: 'field-notes', title: 'Field Notes', summary: 'Images from the road: small rituals, long afternoons, and places that stay with us.', body: 'A collection of commissioned and personal work made between assignments.', year: 2024, category: 'Brand', tags: ['travel', 'brand'], status: 'published', featured: true, location: 'Mediterranean', client: 'Aster House', coords: 'N 37°59′ · E 23°43′', camera: 'Hasselblad 907X', format: 'Medium format', credits: 'Creative direction / Studio 01 · Production / Aster House', cover: image('olive', 'Olive branches in late afternoon light').src, coverAlt: 'Olive branches in late afternoon light', coverLqip: image('olive', '').lqip, coverSrcSet: image('olive', '').srcSet, updatedAt: '2026-09-10', assets: [asset('field-road', 'field', 'A road through a sunlit field'), asset('field-forest', 'forest', 'A path beneath tall trees')],
  },
  {
    id: 'p4', slug: 'quiet-spaces', title: 'Quiet Spaces', summary: 'A visual language for a new kind of hospitality.', body: 'Draft project ready for final selects.', year: 2026, category: 'Interior', tags: ['brand', 'interior'], status: 'draft', featured: false, location: 'Copenhagen', client: 'Lumen House', coords: 'N 55°40′ · E 12°34′', camera: 'Sony A7R V', format: 'Digital stills', credits: 'Photographer / Alex Rivera · Art direction / Lumen House', cover: image('studio', 'Sunlight across a quiet studio table').src, coverAlt: 'Sunlight across a quiet studio table', coverLqip: image('studio', '').lqip, coverSrcSet: image('studio', '').srcSet, updatedAt: '2026-09-28', assets: [asset('quiet-camera', 'camera', 'Camera and production tools'), asset('quiet-hands', 'hands', '')],
  },
  {
    id: 'p5', slug: 'further-away', title: 'Further Away', summary: 'A short film about distance, return and the roads between.', body: 'A travel film made over three long weekends on the waterline.', year: 2023, category: 'Film', tags: ['travel', 'film'], status: 'published', featured: false, location: 'Norway', client: 'Field Journal', coords: 'N 60°23′ · E 5°19′', camera: 'Sony FX3', format: '4K / 24 fps', credits: 'Director / Alex Rivera · Sound / Jo Berg', cover: image('mountainLake', 'A lone figure above a mountain lake').src, coverAlt: 'A lone figure above a mountain lake', coverLqip: image('mountainLake', '').lqip, coverSrcSet: image('mountainLake', '').srcSet, updatedAt: '2026-08-18', assets: [asset('further-meadow', 'meadow', 'A meadow meeting the sea'), asset('further-road', 'road', 'A vehicle on a coastal road')],
  },
  {
    id: 'p6', slug: 'the-quiet-ones', title: 'The Quiet Ones', summary: 'A portrait series about care, craft and the people who keep places alive.', body: 'Portraits made in the last working hours of small family businesses.', year: 2022, category: 'Editorial', tags: ['portrait', 'culture'], status: 'published', featured: false, location: 'Kyoto', client: 'Common Ground', coords: 'N 35°00′ · E 135°46′', camera: 'Nikon Zf', format: '35 mm stills', credits: 'Photographer / Alex Rivera · Words / Mika Sato', cover: image('desert', 'A quiet figure in a warm landscape').src, coverAlt: 'A quiet figure in a warm landscape', coverLqip: image('desert', '').lqip, coverSrcSet: image('desert', '').srcSet, updatedAt: '2026-07-04', assets: [asset('quiet-shore', 'shore', 'A figure beside the sea'), asset('quiet-wave', 'wave', 'A soft horizon at dusk')],
  },
]
