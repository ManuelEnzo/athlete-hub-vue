// src/config/index.js
const config = {
  siteName: import.meta.env.VITE_ATHLETE_HUB_SITE_NAME || 'Athlete Hub',
  siteDescription: import.meta.env.VITE_ATHLETE_HUB_SITE_DESCRIPTION || 'Your Ultimate Resource...',
  siteKeywords: import.meta.env.VITE_ATHLETE_HUB_SITE_KEYWORDS || 'athlete, sports...',
  apiEndpoint: import.meta.env.VITE_ATHLETE_HUB_API || 'https://noteworthy-sociologistically-rhea.ngrok-free.dev/api/v1',
  // endpoint used for public forms (waitlist / contact) - can be proxied via backend in production
  formEndpoint: import.meta.env.VITE_ATHLETE_HUB_FORM_ENDPOINT || 'https://formsubmit.co/ajax/athletehub.sport@gmail.com',
  // Social card image for OG/Twitter meta tags — override via env in production
  siteOgImage: import.meta.env.VITE_ATHLETE_HUB_OG_IMAGE || '/social-card.png',
}

export default config
