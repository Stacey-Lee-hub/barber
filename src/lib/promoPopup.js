// Lets any part of the page open the first-visit offer popup on demand,
// even if it was dismissed earlier.
export const OPEN_PROMO_EVENT = 'crown-razor:open-offer'

export function openPromoPopup() {
  window.dispatchEvent(new Event(OPEN_PROMO_EVENT))
}
