import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { siteSettings, projects } from '../src/lib/mockData'

beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
  vi.stubGlobal('indexedDB', new IDBFactory())
})
afterEach(() => vi.unstubAllGlobals())

describe('local media persistence', () => {
  it('stores large files in IndexedDB and resolves fresh URLs after a document reload', async () => {
    const { uploadMedia } = await import('../src/lib/uploadMedia')
    const { saveSettings, saveProject } = await import('../src/lib/portfolioApi')
    const file = new File([new Uint8Array(4 * 1024 * 1024)], 'portrait.png', { type: 'image/png' })
    const progress = vi.fn()
    const asset = await uploadMedia(file, progress)
    expect(progress).toHaveBeenLastCalledWith(100)
    expect(localStorage.getItem('studio-demo-assets')!.length).toBeLessThan(1000)
    await saveSettings({ ...siteSettings, content: { texts: {}, images: { about: { src: asset.src, alt: '本地肖像' } } } })
    await saveProject({ ...projects[0], id: 'local-project', slug: 'local-project', assets: [asset], cover: asset.src, coverAlt: '本地肖像', status: 'published' })
    // Drop all module caches, including the Blob URL map, as a real reload does.
    vi.resetModules()
    const { loadPublicData, loadMediaLibrary } = await import('../src/lib/portfolioApi')
    const publicData = await loadPublicData()
    const image = publicData.settings.content!.images.about
    expect(image.src).toMatch(/^blob:/)
    expect(image.src).not.toBe(asset.src)
    expect(image.alt).toBe('本地肖像')
    const project = publicData.projects.find(item => item.id === 'local-project')!
    expect(project.cover).toBe(image.src)
    expect(project.assets[0].src).toBe(image.src)
    expect((await loadMediaLibrary()).find(item => item.id === asset.id)!.src).toBe(image.src)
  })

  it('keeps legacy data URL images and all existing settings readable', async () => {
    const legacy = 'data:image/png;base64,b2xk'
    localStorage.setItem('studio-demo-settings', JSON.stringify({ ...siteSettings, heroImage: legacy, content: { texts: { 'home.heroTitle': { zh: '原有标题', en: 'Original title' } }, images: { about: { src: legacy, alt: '原有肖像' } } } }))
    const { loadPublicData } = await import('../src/lib/portfolioApi')
    const { settings } = await loadPublicData()
    expect(settings.heroImage).toBe(legacy)
    expect(settings.content!.images.about).toEqual({ src: legacy, alt: '原有肖像' })
    expect(settings.content!.texts['home.heroTitle'].zh).toBe('原有标题')
  })

  it('reports unavailable browser storage without reporting upload success or changing the media list', async () => {
    vi.stubGlobal('indexedDB', undefined)
    const { uploadMedia } = await import('../src/lib/uploadMedia')
    const progress = vi.fn()
    await expect(uploadMedia(new File(['test'], 'portrait.png', { type: 'image/png' }), progress)).rejects.toThrow('不支持本地媒体存储')
    expect(progress).not.toHaveBeenCalledWith(100)
    expect(localStorage.getItem('studio-demo-assets')).toBeNull()
  })

  it('still rejects files beyond the configured limit before opening storage', async () => {
    const { uploadMedia } = await import('../src/lib/uploadMedia')
    const progress = vi.fn()
    await expect(uploadMedia({ name: 'too-large.jpg', type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 } as File, progress)).rejects.toThrow('不能超过 5 MB')
    expect(progress).not.toHaveBeenCalled()
    expect(localStorage.getItem('studio-demo-assets')).toBeNull()
  })
})
