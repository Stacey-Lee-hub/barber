// Business identity and contact details live in the shared module so the confirmation
// email uses the same values. Services, prices, durations, barbers and opening hours
// come from Supabase.
export { ADDRESS_LINES, BUSINESS, FULL_ADDRESS } from '@shared/business.js'

export const FIRST_VISIT_OFFER = {
  code: 'CROWN15',
  percent: 15,
  eligibleLabel: 'The Signature Crown Cut or The Executive Package',
}

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/barbers', label: 'Our Barbers' },
  { to: '/contact', label: 'Contact' },
]
