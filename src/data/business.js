// Single source for business identity and contact details.
// Services, prices, durations, barbers and opening hours come from Supabase.

export const BUSINESS = {
  name: 'The Crown & Razor Co.',
  shortName: 'Crown & Razor',
  tagline: 'Premium Grooming & Classic Barbering for the Modern Gentleman',
  established: 2018,
  address: {
    street: '142 Bree Street, Suite 102',
    suburb: 'Cape Town City Centre',
    city: 'Cape Town',
    postalCode: '8001',
    country: 'South Africa',
  },
  phone: { display: '(021) 019 2834', href: 'tel:+27210192834' },
  email: 'contact@crownandrazor.com',
  timezoneLabel: 'South African Standard Time (SAST)',
  // South Africa does not observe daylight saving, so the abbreviation never changes.
  timezoneAbbr: 'SAST',
  currency: 'ZAR',
  domain: 'crownandrazor.com',
}

const { address } = BUSINESS

/** Address split for display: ['142 Bree Street, Suite 102', 'Cape Town City Centre, Cape Town, 8001'] */
export const ADDRESS_LINES = [address.street, `${address.suburb}, ${address.city}, ${address.postalCode}`]

export const FULL_ADDRESS = `${ADDRESS_LINES.join(', ')}, ${address.country}`

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
