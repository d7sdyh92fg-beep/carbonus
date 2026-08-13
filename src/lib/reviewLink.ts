/**
 * Google atsiliepimo nuoroda.
 *
 * Kaip ją surasti:
 * 1. Google Business Profile (business.google.com) -> pasirinkite Carbonus.
 * 2. "Ask for reviews" / "Prašyti atsiliepimų" -> nukopijuokite nuorodą (https://g.page/r/....../review).
 * 3. Įklijuokite ją žemiau į GOOGLE_REVIEW_URL.
 *
 * Alternatyva: Google Maps -> Carbonus kortelė -> Share -> Copy link.
 */
export const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=Carbonus+automobili%C5%B3+nuoma+Druskininkai";

export const GOOGLE_REVIEW_URL_IS_PLACEHOLDER = GOOGLE_REVIEW_URL.includes("google.com/maps/search");
