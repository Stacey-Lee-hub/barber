import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PromoPopup from './PromoPopup'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1}>
        {/* Keeps header and footer on screen while a lazily loaded page arrives. */}
        <Suspense fallback={<div className="page-fallback" role="status" aria-label="Loading page" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <PromoPopup />
    </>
  )
}
