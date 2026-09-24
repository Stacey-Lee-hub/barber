import { useEffect } from 'react'

const SITE = 'The Crown & Razor Co.'
const DEFAULT_TITLE = `${SITE} | Premium Grooming & Classic Barbering`

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el && value) el.setAttribute(attr, value)
}

export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : DEFAULT_TITLE
    document.title = fullTitle
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', description)
  }, [title, description])
}
