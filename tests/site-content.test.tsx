import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { imageVariants, editableTexts } from '../src/lib/siteContent'
import { loadAdminData, loadPublicData, projectPayload, saveProject } from '../src/lib/portfolioApi'
import { projects, siteSettings } from '../src/lib/mockData'

vi.mock('../src/lib/motion-runtime', () => ({ MotionRuntime: () => null }))

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear()
  localStorage.setItem('studio-session', '1')
  sessionStorage.setItem('studio-preloader-seen', '1')
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  window.scrollTo = vi.fn()
  globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} } as unknown as typeof IntersectionObserver
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('admin to public content round trip', () => {
  it('saves brand, hero, home manifesto and image and renders the same values publicly after refresh', async () => {
    const view = render(<MemoryRouter initialEntries={['/admin/settings']}><App /></MemoryRouter>)
    await waitFor(() => expect(screen.getByLabelText('站点名称')).toHaveValue(siteSettings.siteName))
    fireEvent.change(screen.getByLabelText('站点名称'), { target: { value: '星光影像' } })
    fireEvent.change(screen.getByLabelText('首屏标题（中英文共用）'), { target: { value: '我的真实首页' } })
    fireEvent.change(screen.getByLabelText('图片地址（使用私有媒体时请选择下方媒体库）'), { target: { value: 'https://images.example.com/custom.webp' } })
    fireEvent.change(screen.getByLabelText('图片描述 / Alt'), { target: { value: '我的海岸封面' } })
    const manifestoKey = Object.keys(editableTexts).find(key => editableTexts[key].zh.startsWith('我们为安静的细节'))!
    fireEvent.change(screen.getByLabelText(`${manifestoKey} zh`), { target: { value: '这是后台写入的宣言。' } })
    fireEvent.change(screen.getByLabelText('主色'), { target: { value: '#7caed5' } })
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }))
    await screen.findByText('设置已保存，打开或刷新主站即可查看。')
    view.unmount()
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    await screen.findByRole('heading', { name: '我的真实首页' })
    expect(screen.getByRole('link', { name: '星光影像' })).toBeInTheDocument()
    expect(screen.getByText('这是后台写入的宣言。')).toBeInTheDocument()
    expect(screen.getByAltText('我的海岸封面')).toHaveAttribute('src', 'https://images.example.com/custom.webp')
    expect(screen.getByAltText('我的海岸封面')).not.toHaveAttribute('srcset')
    expect(document.documentElement.style.getPropertyValue('--olive-rgb')).toBe('124 174 213')
    expect(document.title).toBe('星光影像 — 我的真实首页')
  })

  it('saves independent Chinese and English homepage copy', async () => {
    const saved = { ...siteSettings, content: { texts: { 'home.heroTitle': { zh: '中文作品集', en: 'English portfolio' } }, images: {} } }
    localStorage.setItem('studio-demo-settings', JSON.stringify(saved))
    render(<MemoryRouter><App /></MemoryRouter>)
    await screen.findByRole('heading', { name: '中文作品集' })
    fireEvent.click(screen.getAllByRole('button', { name: '切换语言' })[0])
    await screen.findByRole('heading', { name: 'English portfolio' })
  })

  it('keeps published work public when saving changes, and filters it after taking offline', async () => {
    const project = { ...projects[1], sortOrder: -2, title: '已发布项目修改', cover: projects[1].assets[0].src, coverAlt: projects[1].assets[0].alt }
    await saveProject(project)
    expect((await loadPublicData()).projects[0].title).toBe('已发布项目修改')
    expect((await loadAdminData()).projects.find(item => item.id === project.id)?.status).toBe('published')
    await saveProject(project, 'archived')
    expect((await loadPublicData()).projects.some(item => item.id === project.id)).toBe(false)
    expect((await loadAdminData()).projects.some(item => item.id === project.id)).toBe(true)
  })

  it('uses asset IDs for cover selection even after signed URLs change, and preserves media order', () => {
    const project = { ...projects[1], coverAssetId: projects[1].assets[1].id, cover: 'https://expired.example/old-url', coverAlt: '新的封面 Alt', sortOrder: 7, assets: [...projects[1].assets].reverse() }
    const payload = projectPayload(project)
    expect(payload.cover_asset_id).toBe(project.coverAssetId)
    expect(payload.assets[0]).toMatchObject({ id: project.coverAssetId, position: 0, alt: '新的封面 Alt' })
    expect(payload.status).toBe('published')
    expect(payload.sort_order).toBe(7)
  })

  it('the actual editor saves cover, location, order and title while preserving publication', async () => {
    const project = { ...projects[1], cover: projects[1].assets[0].src, coverAlt: projects[1].assets[0].alt, coverAssetId: projects[1].assets[0].id }
    localStorage.setItem('studio-demo-projects', JSON.stringify([project]))
    render(<MemoryRouter initialEntries={[`/admin/projects/${project.id}`]}><App /></MemoryRouter>)
    await screen.findByRole('heading', { name: project.title })
    fireEvent.change(screen.getByLabelText('标题'), { target: { value: '后台真实操作验证' } })
    fireEvent.change(screen.getByLabelText('拍摄地点'), { target: { value: '上海' } })
    fireEvent.change(screen.getByLabelText('展示顺序（数字越小越靠前）'), { target: { value: '-4' } })
    fireEvent.change(screen.getByLabelText('封面图片'), { target: { value: project.assets[1].id } })
    fireEvent.click(screen.getByRole('button', { name: '下移媒体 1' }))
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }))
    await screen.findByText('项目已发布。')
    const saved = (await loadPublicData()).projects[0]
    expect(saved).toMatchObject({ title: '后台真实操作验证', location: '上海', status: 'published', sortOrder: -4, coverAssetId: project.assets[1].id })
    expect(saved.assets[0].id).toBe(project.assets[1].id)
    expect(saved.cover).toBe(project.assets[1].src)
  })

  it('uploads a demo image from settings, then persists it through a public reload', async () => {
    const view = render(<MemoryRouter initialEntries={['/admin/settings']}><App /></MemoryRouter>)
    await screen.findByLabelText('站点名称')
    const file = new File(['image-content'], 'demo-photo.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText('上传并替换图片'), { target: { files: [file] } })
    await screen.findByText('图片已上传并选中；保存修改后主站生效。')
    fireEvent.click(screen.getByRole('button', { name: '保存修改' }))
    await screen.findByText('设置已保存，打开或刷新主站即可查看。')
    view.unmount()
    render(<MemoryRouter><App /></MemoryRouter>)
    await waitFor(() => expect(screen.getByAltText('demo-photo')).toHaveAttribute('src', expect.stringContaining('data:image/png;base64,')))
    expect(screen.getByAltText('demo-photo')).not.toHaveAttribute('srcset')
  })

  it('never fabricates thumbnails for uploaded, external or unknown bundled files', () => {
    expect(imageVariants('/images/hero.webp').srcSet).toContain('hero-900.webp')
    expect(imageVariants('/images/custom.webp')).toEqual({})
    expect(imageVariants('https://example.com/photo.webp')).toEqual({})
    expect(imageVariants('https://project.supabase.co/storage/v1/object/sign/media/a.webp?token=expired')).toEqual({})
  })
})
