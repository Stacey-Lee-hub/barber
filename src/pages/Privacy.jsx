import { Link } from 'react-router-dom'
import LegalPage, { DraftNote } from '../components/ui/LegalPage'
import { BUSINESS } from '../data/business'
import useDocumentMeta from '../hooks/useDocumentMeta'

const sections = [
  {
    id: 'collect',
    title: 'What we collect',
    body: (
      <>
        <p>When you book an appointment online we collect:</p>
        <ul>
          <li>Your full name, email address and phone number</li>
          <li>Any appointment notes you choose to add</li>
          <li>
            Your appointment details: service, barber, date and time, price, any promo code discount and the time the
            booking was made
          </li>
        </ul>
        <p>
          We do not ask you to create an account, and we do not collect payment card details on this website.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use it',
    body: (
      <ul>
        <li>To reserve your appointment and prevent double bookings</li>
        <li>To email you a booking confirmation with your appointment details</li>
        <li>To contact you about your appointment if something changes</li>
        <li>To check eligibility for first-visit offers (by looking for earlier bookings with the same email)</li>
        <li>To let you cancel your own booking using your reference and email address</li>
      </ul>
    ),
  },
  {
    id: 'storage',
    title: 'Where it is stored',
    body: (
      <>
        <p>
          Booking records are stored in a database hosted by Supabase. Appointment records are not publicly readable:
          the website can only create, check availability for, or cancel bookings through secured server functions,
          and availability checks only reveal which times are taken — never who booked them.
        </p>
        <p>Access to the full records is limited to the shop.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <DraftNote>
        A fixed retention period has not yet been set. Until it is, booking records are kept for as long as they are
        needed to manage appointments and keep business records, and you can ask us to delete yours at any time.
      </DraftNote>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing',
    body: (
      <>
        <p>
          We do not sell your information or use it for advertising. The only email we send is your booking
          confirmation — no marketing emails.
        </p>
        <p>This website relies on a small number of service providers:</p>
        <ul>
          <li>Supabase — database and booking functions</li>
          <li>Resend — delivers your booking confirmation email (your name, email and appointment details)</li>
          <li>Our website host — serves the pages and keeps standard server logs</li>
          <li>Google Fonts — delivers the typefaces used on the site</li>
          <li>
            Google Calendar — only if you choose “Add to Google Calendar”, which sends your appointment details to Google
            in your own browser
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'browser',
    title: 'Cookies & browser storage',
    body: (
      <p>
        We do not use advertising or analytics cookies. Your browser stores a single note that you have dismissed the
        first-visit offer, so it is not shown again for a while. You can clear this at any time in your browser
        settings.
      </p>
    ),
  },
  {
    id: 'rights',
    title: 'Your choices',
    body: (
      <p>
        You can ask to see, correct or delete the booking information we hold about you by emailing{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. You can cancel an upcoming appointment yourself at{' '}
        <Link to="/booking/cancel">Cancel a Booking</Link>.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about this policy? Contact {BUSINESS.name} at{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or{' '}
        <a href={BUSINESS.phone.href}>{BUSINESS.phone.display}</a>.
      </p>
    ),
  },
]

export default function Privacy() {
  useDocumentMeta('Privacy Policy', 'How The Crown & Razor Co. collects, stores and uses booking information.')
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="September 24, 2026"
      intro="What we collect when you book, why, and how it is kept."
      sections={sections}
    />
  )
}
