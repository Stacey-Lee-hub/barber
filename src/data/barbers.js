// Presentation details for barbers, keyed by the slug of the name stored in Supabase.
// Portraits are illustrations — they are labelled as such and do not depict real people.

export const BARBER_STYLE = {
  'marcus-blade-vance': { portrait: 'classic', initials: 'MV', tone: '#3a2e25' },
  'elena-rostova': { portrait: 'crop', initials: 'ER', tone: '#2f2a26' },
  'julian-jules-thorne': { portrait: 'beard', initials: 'JT', tone: '#352b22' },
}

export function barberStyle(barber) {
  if (BARBER_STYLE[barber?.slug]) return BARBER_STYLE[barber.slug]
  const initials = (barber?.name ?? '')
    .replace(/"[^"]*"/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return { portrait: 'classic', initials, tone: '#342c25' }
}
