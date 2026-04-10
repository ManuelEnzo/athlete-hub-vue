# Athlete Hub

[![Built with Nuxt][nuxt-src]][nuxt-href]

**Athlete Hub** is a professional sports performance monitoring platform designed to help coaches and sport scientists track athlete health, readiness, workload, and injury risk in real time.

## Features

- **ACWR Monitoring** — Acute:Chronic Workload Ratio tracking with zone-based risk alerts
- **RPE Collection** — Email-based RPE submission workflow with automated reminders
- **Injury Management** — Injury log with timeline, severity and recovery tracking
- **Sleep History** — Nightly sleep quality data and trend visualization
- **Athlete Dashboard** — Central readiness overview with performance matrix
- **Agenda** — Session scheduling and upcoming appointment management
- **Multi-language** — English and Italian (i18n)

## Getting Started

### Prerequisites

- Node.js 22.x
- pnpm >= 9

### Installation

```bash
git clone https://github.com/manuelenzo/athlete-hub.git
cd athlete-hub
pnpm install
```

### Environment Variables

Copy `.env.development` and configure:

```env
VITE_ATHLETE_HUB_API=http://localhost:PORT/api/v1
VITE_ATHLETE_HUB_SITE_NAME=Athlete Hub
VITE_ATHLETE_HUB_SITE_DESCRIPTION=Professional sports performance monitoring platform
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## App Settings

Sidebar and theme can be configured in `app.config.ts`:

```ts
export default defineAppConfig({
  appSettings: {
    sidebar: {
      collapsible: 'offcanvas', // 'offcanvas' | 'icon' | 'none'
      side: 'left',             // 'left' | 'right'
      variant: 'sidebar',       // 'sidebar' | 'floating' | 'inset'
    },
  },
})
```

## Tech Stack

- [Nuxt 4](https://nuxt.com/) — SSR/SPA framework
- [Vue 3](https://vuejs.org/) — UI framework
- [Shadcn Vue](https://shadcn-vue.com/) — Component library
- [TailwindCSS 4](https://tailwindcss.com/) — Utility-first CSS
- [Pinia](https://pinia.vuejs.org/) — State management
- [vue-i18n](https://vue-i18n.intlify.dev/) — Internationalization

## License

MIT — © Manuel Enzo

[nuxt-src]: https://img.shields.io/badge/Built%20With%20Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com/
