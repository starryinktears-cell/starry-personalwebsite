import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FooterWordmark } from '../src/components/FooterWordmark'
import { PreviewEditing } from '../src/components/EditableContent'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('footer spotlight interaction', () => {
  it('tracks real pointer coordinates, resets on leave, and cancels pending work on unmount', () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('hover'), addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    let callback: FrameRequestCallback = () => undefined
    vi.stubGlobal('requestAnimationFrame', vi.fn((next: FrameRequestCallback) => { callback = next; return 42 }))
    const cancel = vi.fn(); vi.stubGlobal('cancelAnimationFrame', cancel)
    // jsdom does not supply PointerEvent coordinates without a constructor.
    vi.stubGlobal('PointerEvent', MouseEvent)
    const view = render(<FooterWordmark text="Starry Ink" />)
    const wordmark = screen.getByRole('img', { name: 'Starry Ink' })
    vi.spyOn(wordmark, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 100, left: 0, top: 100, right: 800, bottom: 270, width: 800, height: 170, toJSON() {} })
    fireEvent.pointerMove(wordmark, { clientX: 200, clientY: 185 })
    callback(0)
    expect(wordmark.querySelector('radialGradient')).toHaveAttribute('cx', '400')
    expect(wordmark.querySelector('radialGradient')).toHaveAttribute('cy', '170')
    expect(wordmark).toHaveAttribute('data-active', 'true')
    fireEvent.pointerLeave(wordmark)
    expect(wordmark).toHaveAttribute('data-active', 'false')
    fireEvent.pointerMove(wordmark, { clientX: 400, clientY: 200 })
    view.unmount(); expect(cancel).toHaveBeenCalledWith(42)
  })
  it('keeps preview editing and reduced-motion views static while preserving accessible text', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
    const frame = vi.fn(); vi.stubGlobal('requestAnimationFrame', frame); vi.stubGlobal('cancelAnimationFrame', vi.fn())
    const view = render(<FooterWordmark text="Starry Ink" />)
    fireEvent.pointerMove(screen.getByRole('img'), { clientX: 200, clientY: 150 })
    expect(frame).not.toHaveBeenCalled()
    view.rerender(<PreviewEditing.Provider value><FooterWordmark text="Custom signature" /></PreviewEditing.Provider>)
    const wordmark = screen.getByRole('img', { name: 'Custom signature' })
    expect(wordmark).toHaveAttribute('data-edit-key', 'footer.wordmark')
    expect(wordmark).not.toHaveAttribute('tabindex')
    fireEvent.pointerMove(wordmark)
    expect(frame).not.toHaveBeenCalled()
  })
})
