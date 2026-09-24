import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'

// Inner pages load on demand to keep the first visit fast.
const Services = lazy(() => import('./pages/Services'))
const About = lazy(() => import('./pages/About'))
const Barbers = lazy(() => import('./pages/Barbers'))
const Contact = lazy(() => import('./pages/Contact'))
const Booking = lazy(() => import('./pages/Booking'))
const CancelBooking = lazy(() => import('./pages/CancelBooking'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return <div className="page-fallback" role="status" aria-label="Loading page" />
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="about" element={<About />} />
          <Route path="barbers" element={<Barbers />} />
          <Route path="contact" element={<Contact />} />
          <Route path="booking" element={<Booking />} />
          <Route path="booking/cancel" element={<CancelBooking />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
