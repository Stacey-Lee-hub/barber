import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * While `active`, keeps Tab focus inside `ref`, calls `onEscape` on Escape,
 * locks page scroll, and restores focus to the previously focused element on exit.
 */
export default function useFocusTrap(ref, active, onEscape, initialFocusRef) {
  useEffect(() => {
    if (!active) return undefined
    const container = ref.current
    const previouslyFocused = document.activeElement
    document.body.classList.add('is-locked')

    const focusFirst = () => {
      const target = initialFocusRef?.current ?? container?.querySelector(FOCUSABLE)
      target?.focus()
    }
    const frame = requestAnimationFrame(focusFirst)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }
      if (event.key !== 'Tab' || !container) return
      const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('is-locked')
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus({ preventScroll: true })
    }
  }, [ref, active, onEscape, initialFocusRef])
}
