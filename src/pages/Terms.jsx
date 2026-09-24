import { Link } from 'react-router-dom'
import LegalPage, { DraftNote } from '../components/ui/LegalPage'
import { BUSINESS, FIRST_VISIT_OFFER, FULL_ADDRESS } from '../data/business'
import { BOOKING_HORIZON_DAYS, MIN_LEAD_MINUTES } from '@shared/schedule.js'
import useDocumentMeta from '../hooks/useDocumentMeta'

const sections = [
  {
    id: 'about',
    title: 'About these terms',
    body: (
      <>
        <p>
          These terms explain how appointments booked through the {BUSINESS.name} website work. By completing a
          booking you agree to them. Where a policy has not yet been finalised by the shop, it is clearly marked as a
          draft.
        </p>
      </>
    ),
  },
  {
    id: 'reservations',
    title: 'Appointment reservations',
    body: (
      <>
        <p>
          Online booking is available for our listed services. You choose a service, a barber (or “Any available
          barber”), a date and a start time. Times are shown in {BUSINESS.timezoneLabel}, the shop’s local time.
        </p>
        <ul>
          <li>
            Your appointment is reserved only once the confirmation screen shows your booking reference. If you do not
            see a reference, no booking was made.
          </li>
          <li>
            The full length of the service is reserved with your barber, so appointments only start at times where the
            complete service fits within opening hours.
          </li>
          <li>
            Bookings can be made up to {BOOKING_HORIZON_DAYS} days ahead and at least {MIN_LEAD_MINUTES} minutes before
            the start time.
          </li>
          <li>
            If you choose “Any available barber”, we assign a barber who is free for the whole appointment and show
            their name on your confirmation.
          </li>
          <li>We do not currently send confirmation emails. Please keep your booking reference.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'information',
    title: 'Your information',
    body: (
      <p>
        Please give your real name, a working email address and phone number so we can reach you about your
        appointment if needed. How we store and use this information is explained in our{' '}
        <Link to="/privacy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'arrival',
    title: 'Arriving for your appointment',
    body: (
      <>
        <p>
          Please arrive a few minutes before your start time. If you are running late, call us on{' '}
          <a href={BUSINESS.phone.href}>{BUSINESS.phone.display}</a> as soon as you can.
        </p>
        <DraftNote>
          Because appointments are booked back to back, a significantly late arrival may mean your service needs to be
          shortened or rebooked so that the next guest is not kept waiting.
        </DraftNote>
      </>
    ),
  },
  {
    id: 'cancellations',
    title: 'Rescheduling & cancellations',
    body: (
      <>
        <p>
          You can cancel an upcoming appointment online at <Link to="/booking/cancel">Cancel a Booking</Link> using your
          booking reference and the email address you booked with, up until the appointment starts. Cancelling
          releases the time so another guest can book it.
        </p>
        <p>
          To reschedule, cancel your existing appointment and book a new time, or contact the shop and we will help.
        </p>
        <p>
          Online booking does not take payment or a deposit, so no cancellation charge is applied through this website.
        </p>
        <DraftNote>
          We kindly ask for as much notice as possible when cancelling. Any further cancellation or no-show policy will
          be published here before it applies.
        </DraftNote>
      </>
    ),
  },
  {
    id: 'pricing',
    title: 'Service pricing',
    body: (
      <>
        <p>
          Prices are shown in South African Rand (ZAR) on our <Link to="/services">Services</Link> page and during booking. The price,
          any discount and the total shown on the review screen are recorded with your booking when you confirm.
        </p>
        <p>Payment is made at the shop. Additional services requested on the day are priced separately.</p>
      </>
    ),
  },
  {
    id: 'promotions',
    title: 'Promotional offers',
    body: (
      <>
        <p>
          The first-visit code <strong>{FIRST_VISIT_OFFER.code}</strong> gives {FIRST_VISIT_OFFER.percent}% off{' '}
          {FIRST_VISIT_OFFER.eligibleLabel} when entered during online booking.
        </p>
        <ul>
          <li>It does not apply to any other service and cannot be combined with other codes.</li>
          <li>
            It is intended for first visits. Eligibility is checked against earlier online bookings made with the same
            email address; we cannot verify visits made without an online booking.
          </li>
          <li>The discount is calculated by our booking system and shown before you confirm.</li>
          <li>Promotions may be changed or withdrawn for future bookings.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'general',
    title: 'General',
    body: (
      <p>
        We may update these terms from time to time; the date at the top of this page shows the latest version. If
        something goes wrong with your booking, please contact us and we will do our best to put it right.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <p>
        {BUSINESS.name}, {FULL_ADDRESS}
        <br />
        Phone: <a href={BUSINESS.phone.href}>{BUSINESS.phone.display}</a> · Email:{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>
    ),
  },
]

export default function Terms() {
  useDocumentMeta('Terms & Conditions', 'Booking terms for appointments at The Crown & Razor Co.')
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      updated="September 24, 2026"
      intro="Plain-language terms for booking with us online."
      sections={sections}
    />
  )
}
