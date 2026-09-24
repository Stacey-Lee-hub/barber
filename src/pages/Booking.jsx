import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import { ErrorBlock, LoadingBlock } from '../components/ui/States'
import BookingFlow from '../components/booking/BookingFlow'
import { useShopData } from '../context/shopDataContext'
import { ANY_BARBER } from '../lib/bookingFlow'
import { BUSINESS } from '../data/business'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function Booking() {
  useDocumentMeta(
    'Book an Appointment',
    'Choose your service, barber, date and time and book your appointment at The Crown & Razor Co. online.',
  )
  const { status, services, barbers, hours, error, retry, serviceById, barberById } = useShopData()
  const [params] = useSearchParams()

  // Preselect only IDs that match live records.
  const requestedService = params.get('service')
  const requestedBarber = params.get('barber')
  const initial = {
    serviceId: serviceById(requestedService)?.id ?? null,
    barberId: requestedBarber === ANY_BARBER ? ANY_BARBER : (barberById(requestedBarber)?.id ?? null),
    promoCode: (params.get('promo') ?? '').slice(0, 32),
  }

  return (
    <>
      <PageHero
        compact
        eyebrow="Online Booking"
        title={
          <>
            Reserve your <em>chair.</em>
          </>
        }
        intro="Pick a service, your barber and a time that suits you. Live availability, confirmed instantly."
      />
      <section className="section section--light booking-section" aria-label="Booking">
        <div className="container">
          {status === 'loading' && <LoadingBlock label="Loading services and barbers…" />}
          {status === 'error' && (
            <ErrorBlock
              title="Online booking is unavailable right now"
              message={`${error?.message ?? ''} You can also book by calling ${BUSINESS.phone.display}.`}
              onRetry={retry}
            />
          )}
          {status === 'ready' && (
            <BookingFlow
              key={`${initial.serviceId}|${initial.barberId}|${initial.promoCode}`}
              initial={initial}
              services={services}
              barbers={barbers}
              hours={hours}
            />
          )}
        </div>
      </section>
    </>
  )
}
