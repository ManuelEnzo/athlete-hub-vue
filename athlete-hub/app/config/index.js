// src/config/index.js
const config = {
  siteName: import.meta.env.VITE_ATHLETE_HUB_SITE_NAME || 'Athlete Hub',
  siteDescription: import.meta.env.VITE_ATHLETE_HUB_SITE_DESCRIPTION || 'Your Ultimate Resource...',
  siteKeywords: import.meta.env.VITE_ATHLETE_HUB_SITE_KEYWORDS || 'athlete, sports...',
  // VITE_ATHLETE_HUB_API must be set:
  //  - Local dev:  .env.development (http://localhost:PORT/api/v1)
  //  - Production: Vercel Dashboard > Environment Variables
  apiEndpoint: import.meta.env.VITE_ATHLETE_HUB_API,
  // endpoint used for public forms (waitlist / contact) - can be proxied via backend in production
  formEndpoint: import.meta.env.VITE_ATHLETE_HUB_FORM_ENDPOINT || 'https://formsubmit.co/ajax/athletehub.sport@gmail.com',
  // Social card image for OG/Twitter meta tags — override via env in production
  siteOgImage: import.meta.env.VITE_ATHLETE_HUB_OG_IMAGE || '/social-card.png',
}

if (!config.apiEndpoint) {
  console.error(
    '[athlete-hub] VITE_ATHLETE_HUB_API is not defined.\n'
    + '  Local dev: add it to .env.development\n'
    + '  Production: set it in Vercel Dashboard > Settings > Environment Variables',
  )
}

export default config
