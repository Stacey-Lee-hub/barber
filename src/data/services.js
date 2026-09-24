// Presentation details for services. Names, prices, durations and descriptions are
// loaded from the Supabase `services` table; this file only adds imagery and copy,
// keyed by the slug of the service name.
import { IMAGES } from './images'

export const SERVICE_MEDIA = {
  'the-signature-crown-cut': { image: IMAGES.texturedCut, note: 'Our house cut' },
  'precision-skin-fade': { image: IMAGES.fade, note: 'Seamless, sharp, exact' },
  'beard-sculpt-and-razor-detail': { image: IMAGES.beard, note: 'Shape, oil, line-up' },
  'the-executive-package': { image: IMAGES.chair, note: 'The full ritual' },
  'young-groom-kids-cut': { image: IMAGES.tools, note: 'Ages 12 and under' },
  'traditional-hot-towel-shave': { image: IMAGES.shave, note: 'Straight razor, hot towels' },
}

export const EXECUTIVE_PACKAGE_SLUG = 'the-executive-package'

export function serviceMedia(service) {
  return SERVICE_MEDIA[service?.slug] ?? { image: IMAGES.tools, note: '' }
}
