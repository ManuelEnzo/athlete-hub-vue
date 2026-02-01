// src/config/index.js

const config = {
  // Nota: assicurati che nel file .env le variabili inizino con VITE_
  siteName: import.meta.env.VITE_SITE_NAME || 'Athlete Hub',
  siteDescription: import.meta.env.VITE_SITE_DESCRIPTION || 'Your Ultimate Resource...',
  siteKeywords: import.meta.env.VITE_SITE_KEYWORDS || 'athlete, sports...',
  apiEndpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:5051/api/v1',
};

export default config;