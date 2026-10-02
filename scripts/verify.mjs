/* eslint-disable no-undef */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const baseUrl = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:4173'
const root = path.resolve(process.cwd())
const screenshotDir = path.join(root, '.goal/screenshots')
const routes = ['/', '/work', '/work/northern-light', '/work/stillness', '/work/field-notes', '/work/further-away', '/work/the-quiet-ones', '/about', '/services', '/contact', '/privacy', '/does-not-exist']
const viewports = [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]
const failures = []
const titles = new Map()

await mkdir(screenshotDir, { recursive: true })
const browser = await chromium.launch({ headless: true })

const inspect = async (page, route, viewport, reducedMotion) => {
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
  const title = await page.title()
  if (!reducedMotion) titles.set(route, title)
  await page.waitForFunction(() => !document.querySelector('.site-preloader'), { timeout: 3500 }).catch(() => {})
  if (!reducedMotion) {
    const name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')
    await page.screenshot({ path: path.join(screenshotDir, `${name}-${viewport.width}.png`), fullPage: true })
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }))
  await page.waitForTimeout(2500)
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }))
  const checks = await page.evaluate(() => {
    const imageIssues = [...document.images].flatMap((image) => {
      const rect = image.getBoundingClientRect()
      const computed = getComputedStyle(image)
      const hasSize = image.hasAttribute('width') || image.hasAttribute('height') || computed.aspectRatio !== 'auto' || (rect.width > 0 && rect.height > 0)
      return image.alt === null || !hasSize ? [image.currentSrc || image.src] : []
    })
    const hiddenContent = [...document.querySelectorAll('body *')].filter((element) => {
      if (element.matches('.menu-curtain, .menu-curtain *')) return false
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return style.opacity === '0' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && (element.textContent || '').trim().length > 0
    }).slice(0, 10).map((element) => element.textContent?.trim().slice(0, 80))
    return { overflow: document.documentElement.scrollWidth > window.innerWidth + 1, imageIssues, hiddenContent }
  })
  if (checks.overflow) failures.push(`${route} ${viewport.width}: horizontal overflow`)
  if (checks.imageIssues.length) failures.push(`${route} ${viewport.width}: image issues ${checks.imageIssues.join(', ')}`)
  if (reducedMotion && checks.hiddenContent.length) failures.push(`${route} ${viewport.width}: hidden content under reduced motion ${checks.hiddenContent.join(' | ')}`)
  if (consoleErrors.length || pageErrors.length) failures.push(`${route} ${viewport.width}: console ${[...consoleErrors, ...pageErrors].join(' | ')}`)
}

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  for (const route of routes) await inspect(page, route, viewport, false)
  await context.close()
}

const reducedContext = await browser.newContext({ viewport: viewports[2], reducedMotion: 'reduce' })
const reducedPage = await reducedContext.newPage()
for (const route of routes) await inspect(reducedPage, route, viewports[2], true)
await reducedContext.close()
await browser.close()

if (new Set(titles.values()).size !== titles.size) {
  const duplicates = [...titles.entries()].filter(([, title]) => [...titles.values()].filter((value) => value === title).length > 1)
  failures.push(`duplicate document titles: ${JSON.stringify(duplicates)}`)
}

console.log(`verified ${routes.length} routes × ${viewports.length} viewports + reduced motion`)
console.log(`screenshots: ${screenshotDir}`)
if (failures.length) { console.error(failures.join('\n')); process.exit(1) }
console.log('all visual verification checks passed')
