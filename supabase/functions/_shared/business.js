// Business identity and contact details, shared by the website and the Edge Functions
// (confirmation emails and calendar files use exactly the same values as the site).

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
