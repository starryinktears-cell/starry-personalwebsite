import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { HomeStage } from '../src/components/HomeStage'

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

it('reveals each visible section once and cancels running animations on cleanup', () => {
  let notify: IntersectionObserverCallback = () => undefined
  const observe = vi.fn(), unobserve = vi.fn(), disconnect = vi.fn(), cancel = vi.fn()
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback }
    observe = observe; unobserve = unobserve; disconnect = disconnect
  })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
  const view = render(<HomeStage><section className="hero-carousel"><div>Hero</div></section><section><div data-testid="body">Body</div></section></HomeStage>)
  const element = view.getByTestId('body')
  const animate = vi.fn().mockReturnValue({ cancel })
  element.animate = animate
  expect(observe).toHaveBeenCalledTimes(1)
  notify([{ isIntersecting: true, target: element } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
  expect(animate).toHaveBeenCalledTimes(1)
  expect(unobserve).toHaveBeenCalledWith(element)
  view.unmount()
  expect(cancel).toHaveBeenCalled()
  expect(disconnect).toHaveBeenCalled()
})

it('keeps content visible without animation when motion is disabled', () => {
  const observer = vi.fn()
  vi.stubGlobal('IntersectionObserver', observer)
  const view = render(<HomeStage motion={false}><section>Readable content</section></HomeStage>)
  expect(view.getByText('Readable content')).toBeVisible()
  expect(observer).not.toHaveBeenCalled()
})
