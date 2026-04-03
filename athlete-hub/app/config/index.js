// src/config/index.js
const config = {
  siteName: import.meta.env.VITE_ATHLETE_HUB_SITE_NAME || 'Athlete Hub',
  siteDescription: import.meta.env.VITE_ATHLETE_HUB_SITE_DESCRIPTION || 'Your Ultimate Resource...',
  siteKeywords: import.meta.env.VITE_ATHLETE_HUB_SITE_KEYWORDS || 'athlete, sports...',
  apiEndpoint: import.meta.env.VITE_ATHLETE_HUB_API || 'http://localhost:5051/api/v1',
  // endpoint used for public forms (waitlist / contact) - can be proxied via backend in production
  formEndpoint: import.meta.env.VITE_ATHLETE_HUB_FORM_ENDPOINT || 'https://formsubmit.co/ajax/athletehub.sport@gmail.com',
}

export default config
