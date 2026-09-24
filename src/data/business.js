// Single source for business identity and contact details.
// Services, prices, durations, barbers and opening hours come from Supabase.

export const BUSINESS = {
  name: 'The Crown & Razor Co.',
  shortName: 'Crown & Razor',
  tagline: 'Premium Grooming & Classic Barbering for the Modern Gentleman',
  established: 2018,
  address: {
    street: '142 Artisan Way, Suite 102',
    city: 'Downtown Metro',
    region: 'CA',
    postalCode: '90210',
  },
  phone: { display: '(555) 019-2834', href: 'tel:+15550192834' },
  email: 'contact@crownandrazor.com',
  timezoneLabel: 'Pacific Time',
  domain: 'crownandrazor.com',
}

export const FULL_ADDRESS = `${BUSINESS.address.street}, ${BUSINESS.address.city}, ${BUSINESS.address.region} ${BUSINESS.address.postalCode}`

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
