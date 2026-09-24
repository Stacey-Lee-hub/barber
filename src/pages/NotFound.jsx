import { LogoMark } from '../components/ui/Logo'
import ButtonLink from '../components/ui/ButtonLink'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function NotFound() {
  useDocumentMeta('Page Not Found', 'The page you were looking for could not be found.')
  return (
    <section className="not-found on-dark" aria-labelledby="nf-title">
      <div className="container not-found__inner">
        <LogoMark className="not-found__mark" />
        <p className="eyebrow eyebrow--plain">Error 404</p>
        <h1 id="nf-title" className="h1">
          A little off <em>the top.</em>
        </h1>
        <p className="lead">We couldn’t find that page. It may have moved, or the link may be mistyped.</p>
        <div className="btn-row not-found__actions">
          <ButtonLink to="/">Back to Home</ButtonLink>
          <ButtonLink to="/booking" variant="light" arrow={false}>
            Book an Appointment
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
