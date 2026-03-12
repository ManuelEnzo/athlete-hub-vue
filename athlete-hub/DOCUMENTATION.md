# 🏃 Athlete Hub - Complete Documentation

![Athlete Hub](https://img.shields.io/badge/Nuxt-3.5+-00DC82?style=flat-square) ![Vue](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-0EA5E9?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> **Athlete Hub** is a comprehensive sports management dashboard built with **Nuxt 3**, **Vue 3**, and **Shadcn-Vue** components. It provides coaches and sports professionals with real-time monitoring, analytics, and management tools for athlete training programs.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Features & Modules](#features--modules)
- [API Integration](#api-integration)
- [Components](#components)
- [Pages](#pages)
- [Internationalization](#internationalization)
- [Configuration](#configuration)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**Athlete Hub** is a web-based dashboard for coaching staff and fitness professionals to:
- Monitor athlete workload and recovery
- Track perceived exertion (RPE) and performance metrics
- Manage training sessions and events
- Analyze athlete health and injury risk
- Generate reports and analytics

The platform uses real-time data synchronization and responsive design to support coaches on desktop and mobile devices.

---

## ✨ Key Features

### 🏆 Dashboard & Analytics
- **Real-time monitoring** of athlete metrics (readiness, ACWR, RPE)
- **Performance matrix** with trend analysis
- **Load distribution** visualization (weekly/monthly)
- **ACWR alerts** (Acute:Chronic Workload Ratio) for injury prevention
- **Team status overview** with critical athlete alerts

### 👥 Athlete Management
- Create, update, and manage athlete profiles
- Track athlete measurements (height, weight, body metrics)
- View athlete performance history
- Search and filter athletes
- Batch operations

### 📅 Training Calendar & Sessions
- Interactive calendar view with session planning
- Create training sessions (Strength, Speed, Recovery, Test, Checkup)
- Assign multiple athletes per session
- Set target RPE (Perceived Exertion) and duration
- Mark sessions as completed
- Track session history

### 📊 RPE (Perceived Exertion) Tracking
- Email-based RPE collection from athletes
- Real-time email delivery status monitoring
- Historical RPE data analysis
- Resend email functionality (with status protection)
- Pagination and filtering on RPE history

### 🧪 Test Management
- Create and manage test definitions with metrics
- Input test results in grid format
- Support for multiple data types (time, categorical, numeric)
- Historical test data tracking

### 🤕 Injury Management
- Record athlete injuries with full details
- Track injury status and recovery timeline
- Update injury information
- Historical injury logs

### 📧 Email & Notifications
- Background email queue system
- Status tracking (Pending, Processing, Completed, Failed)
- Resend email functionality
- Toast notifications for user feedback

### 🌍 Multi-language Support
- English & Italian localization
- Dynamic language switching
- Complete translation files

### 🎨 UI/UX Features
- Dark/Light theme toggle
- Customizable theme colors (8 color schemes)
- Responsive design (mobile, tablet, desktop)
- Accessibility-focused components
- Loading states and skeleton screens
- Empty state messaging

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Nuxt** | 3.5+ | Meta-framework for Vue.js |
| **Vue.js** | 3.5+ | Progressive JavaScript framework |
| **TypeScript** | Latest | Type safety and development experience |
| **TailwindCSS** | 4.0+ | Utility-first CSS framework |
| **Shadcn-Vue** | Latest | High-quality UI component library |
| **Pinia** | Latest | State management store |
| **Vue I18n** | Latest | Internationalization (i18n) |
| **Vue Sonner** | Latest | Toast notifications |
| **Lucide Vue Next** | Latest | Beautiful SVG icon library |
| **Axios** | Latest | HTTP client for API calls |
| **VueUse** | Latest | Vue 3 composition utilities |
| **Nuxt ESLint** | Latest | Linting & code quality |

---

## 📁 Project Structure

```
athlete-hub/
├── app/
│   ├── api/                          # API integration layer
│   │   ├── auth.ts                   # Authentication endpoints
│   │   ├── business.ts               # Main business logic API
│   │   └── client.ts                 # Axios client setup
│   │
│   ├── assets/                       # Static assets
│   │   └── css/
│   │       ├── tailwind.css          # Tailwind configuration
│   │       └── themes.css            # Theme customization
│   │
│   ├── components/                   # Vue components
│   │   ├── ui/                       # Shadcn-Vue reusable UI components
│   │   ├── agenda/                   # Calendar/Scheduling components
│   │   ├── athelete/                 # Athlete-related components
│   │   ├── athletehealthc/           # Health monitoring components
│   │   ├── athletemeasurements/      # Measurement tracking components
│   │   ├── athmanagement/            # Athlete management components
│   │   ├── auth/                     # Authentication components
│   │   ├── base/                     # Base/Layout components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── injury/                   # Injury management components
│   │   ├── kanban/                   # Kanban board components
│   │   ├── layout/                   # Layout wrappers
│   │   ├── mail/                     # Email management components
│   │   ├── navigation-menu/          # Navigation UI
│   │   ├── rpedetails/               # RPE tracking components
│   │   ├── rpeinput/                 # RPE input forms
│   │   ├── settings/                 # Settings components
│   │   ├── tasks/                    # Task management
│   │   ├── testmanage/               # Test management components
│   │   └── [other categories]
│   │
│   ├── composables/                  # Reusable Vue composition functions
│   │   ├── defineShortcuts.ts        # Keyboard shortcuts
│   │   ├── useAppSettings.ts         # App settings management
│   │   ├── useKanban.ts              # Kanban logic
│   │   └── useShortcuts.ts           # Shortcut utilities
│   │
│   ├── config/                       # App configuration
│   │   └── index.js                  # Config exports
│   │
│   ├── constants/                    # Application constants
│   │   ├── eventConfig.ts            # Event type configurations
│   │   ├── menus.ts                  # Menu definitions
│   │   └── themes.ts                 # Theme constants
│   │
│   ├── layouts/                      # Nuxt layouts
│   │   ├── default.vue               # Default main layout
│   │   └── blank.vue                 # Blank layout (auth, etc.)
│   │
│   ├── lib/                          # Utility functions
│   │   └── utils.ts                  # Common utilities
│   │
│   ├── middleware/                   # Route middleware
│   │   └── auth.global.ts            # Global auth middleware
│   │
│   ├── pages/                        # Nuxt pages (auto-routed)
│   │   ├── index.vue                 # Home/Dashboard
│   │   ├── agenda.vue                # Calendar/Sessions
│   │   ├── athletedetails.vue        # Athlete details view
│   │   ├── athletehealth.vue         # Health monitoring
│   │   ├── athletemanagement.vue     # Athlete management
│   │   ├── athletemeasurements.vue   # Measurements page
│   │   ├── email.vue                 # Email management
│   │   ├── injuriesmanager.vue       # Injury management
│   │   ├── kanban.vue                # Kanban board
│   │   ├── rpedetails.vue            # RPE history/details
│   │   ├── tasks.vue                 # Tasks page
│   │   ├── testmanagement.vue        # Test management
│   │   ├── (auth)/                   # Auth pages (login/signup)
│   │   ├── (error)/                  # Error pages
│   │   ├── rpe/                      # RPE subpages
│   │   └── settings/                 # Settings subpages
│   │
│   ├── plugins/                      # Nuxt plugins
│   │   ├── axios.client.ts           # Axios config plugin
│   │   ├── i18n.ts                   # i18n plugin setup
│   │   └── ssrWidth.ts               # Window width plugin
│   │
│   ├── stores/                       # Pinia stores
│   │   ├── auth.ts                   # Auth store
│   │   └── loadingStore.ts           # Global loading state
│   │
│   ├── types/                        # TypeScript types/interfaces
│   │   ├── api.ts                    # API response types
│   │   ├── appSettings.d.ts          # App settings types
│   │   ├── kanban.ts                 # Kanban data types
│   │   └── nav.d.ts                  # Navigation types
│   │
│   ├── app.vue                       # Root Vue component
│   ├── app.config.ts                 # App configuration
│   └── components.json               # Shadcn-Vue config
│
├── i18n/                             # Internationalization files
│   ├── en.json                       # English translations
│   └── it.json                       # Italian translations
│
├── public/                           # Static files
│   └── avatars/                      # Avatar images
│
├── server/                           # Server-side code (if any)
│   └── tsconfig.json
│
├── nuxt.config.ts                    # Nuxt configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind configuration
├── package.json                      # Dependencies & scripts
├── vercel.json                        # Vercel deployment config
├── renovate.json                      # Automated dependencies updates
├── eslint.config.js                  # ESLint configuration
└── README.md                         # Project README
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 22.x or higher
- **pnpm**: 9.0 or higher (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dianprata/athlete-hub.git
cd athlete-hub

# Install dependencies
pnpm install
# or
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API endpoints and settings
```

### Development

```bash
# Start dev server (http://localhost:3000)
pnpm run dev

# Run type checking
pnpm run typecheck

# Run linter
pnpm run lint

# Fix linting issues
pnpm run format
```

### Production

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Generate static site
pnpm run generate
```

---

## 🎨 Features & Modules

### 1. Dashboard Module
**Location**: `pages/index.vue` + `components/dashboard/`

Features:
- Real-time athlete metrics overview
- ACWR (Acute:Chronic Workload Ratio) monitoring
- Weekly load trends
- Readiness status distribution
- Critical alerts and athlete at-risk indicators
- Performance matrix visualization

### 2. Athlete Management
**Location**: `pages/athletemanagement.vue` + `components/athmanagement/`

Features:
- List/grid view of all monitored athletes
- Create new athlete profiles
- Edit athlete information
- Delete athletes
- Search and filter athletes
- View athlete statistics

### 3. Calendar & Session Management
**Location**: `pages/agenda.vue` + `components/agenda/AgendaCalendar.vue`

Features:
- Interactive monthly calendar view
- Create training sessions with:
  - Multiple athletes
  - Session type (Strength, Speed, Recovery, Test, Checkup)
  - Time and duration
  - Target RPE
  - Session completion tracking
- Edit existing sessions
- Delete sessions (protected if results exist)
- Color-coded event display by type
- Full validation on create/update

### 4. RPE (Perceived Exertion) System
**Location**: `pages/rpedetails.vue` + components

Features:
- Email-based RPE collection from athletes
- Status tracking: Pending → Processing → Completed/Failed
- View delivery status for all sent emails
- Historical RPE data with filtering
- Resend emails (protected for "Processing" status)
- Athlete-based filtering
- Chronological history view with pagination

### 5. Test Management
**Location**: `pages/testmanagement.vue`

Features:
- Create test definitions with custom metrics
- Input test results in structured grid format
- Support multiple data types (time, text, numeric)
- Store historical test results
- Metric unit tracking

### 6. Injury Management
**Location**: `pages/injuriesmanager.vue`

Features:
- Record athlete injuries with details
- Track injury status
- Recovery timeline
- Update injury information
- Full injury history

### 7. Email Management
**Location**: `pages/email.vue` + `components/mail/MailCompLayout.vue`

Features:
- View email delivery queue status
- Filter by athlete or delivery status
- Search functionality
- Resend capability (blocked for "Processing" status)
- Real-time status updates
- Pagination

### 8. Settings
**Location**: `pages/settings/`

Features:
- User profile management
- Theme customization (8 colors available)
- Sidebar preferences (collapsible, icon, none)
- Dark/Light mode toggle
- Language selection

### 9. Authentication
**Location**: `pages/(auth)/`

Features:
- Login/Signup forms
- OTP (One-Time Password) verification
- Password reset
- Session management

---

## 📡 API Integration

### Base API Setup
**File**: `app/api/client.ts`

Axios configured with:
- Base URL from environment variables
- Automatic interceptors for auth tokens
- Error handling
- Response transformation

### Main Business API
**File**: `app/api/business.ts`

Endpoints grouped by resource:

#### Athletes
```typescript
athleteApi.getAll()                    // Get all athletes
athleteApi.getById(id)                 // Get athlete by ID
athleteApi.create(data)                // Create athlete
athleteApi.update(id, data)            // Update athlete
athleteApi.delete(id)                  // Delete athlete
```

#### Measurements
```typescript
athleteApi.getAllMeasurements()
athleteApi.getMeasurementsByAthlete(athleteId)
athleteApi.createMeasurement(data)
athleteApi.updateMeasurement(id, data)
athleteApi.deleteMeasurement(id)
```

#### Calendar Events
```typescript
athleteApi.getAllEvents(month, year)
athleteApi.getEventsByAthlete(athleteId)
athleteApi.createEvent(data)
athleteApi.updateEvent(id, data)
athleteApi.deleteEvent(id)
athleteApi.getTestGrid(eventId)       // Get test entry grid
athleteApi.saveTestResults(eventId, results)
```

#### RPE System
```typescript
athleteApi.getLastSessionInfo()        // Last RPE session overview
athleteApi.getHistoricalAnalysis(athleteId, page, pageSize)
athleteApi.submitRpe(data)             // Submit RPE value
athleteApi.getAllInfoFromToken(tokenId)
athleteApi.getInfoForEmailStatus(page, pageSize)
athleteApi.resendRpeEmail(email)
```

#### Additional Endpoints
- Test definitions CRUD
- Injury management CRUD
- Dashboard summary data
- Analytics/workload data

---

## 🧩 Key Components

### UI Components (Shadcn-Vue)
- **Card**: Container for content sections
- **Button**: Interactive buttons with variants
- **Input**: Text inputs
- **Badge**: Status/tag indicators
- **Dialog**: Modal dialogs
- **Dropdown Menu**: Context menus
- **Tabs**: Tab navigation
- **Select**: Dropdown selects
- **Table**: Data tables
- **And 30+ more...**

### Custom Components

#### MailCompLayout.vue
Email status monitoring with:
- Athlete search and status filtering
- Real-time email delivery tracking
- Resend capability (status-protected)
- Pagination and sorting

**Enhancements**:
- Client-side filtering (athlete & status)
- Working search across name, email, status
- Protected resend for "Processing" status
- Badge indicators for email status

#### AgendaCalendar.vue
Session management with:
- Calendar grid view
- Create/Edit/Delete sessions
- Multi-athlete selection
- Form validation for all required fields
- Test result input grid

**Validations**:
- Title, athlete(s), type, duration required
- Target RPE required (except Recovery/Checkup)
- Test selection required for Test events
- Button disabled until form is valid
- Toast error messages for missing fields

#### RpeDetailsCmp.vue
RPE tracking with improved UX:
- Athlete filtering with dropdown
- Loading skeleton placients
- Emoji annotations for quick scanning
- Improved card design with RPE color indicators
- Empty state messaging
- Clear pagination and load-more buttons
- History detail view with target/status info

---

## 🌍 Internationalization

### Supported Languages
- **English** (`en.json`)
- **Italian** (`it.json`)

### Translation Structure
Main categories:
- `dashboard`: Dashboard strings
- `metrics`: Performance metrics
- `charts`: Chart labels
- `alerts`: Alert messages
- `sessions`: Session management
- `calendar`: Calendar/agenda strings
- `rpe`: RPE system strings
- `injury`: Injury management strings
- `auth`: Authentication strings
- `common`: Common UI strings

### Usage
```typescript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const title = t('dashboard.title')
const withParams = t('rpe.pagination.pageInfo', { current: 1, total: 10 })
```

---

## ⚙️ Configuration

### App Settings
**File**: `app/app.config.ts`

```typescript
export default defineAppConfig({
  appSettings: {
    sidebar: {
      collapsible: 'offcanvas', // 'offcanvas' | 'icon' | 'none'
      side: 'left',  // 'left' | 'right'
      variant: 'inset', // 'sidebar' | 'floating' | 'inset'
    },
    theme: {
      color: 'default', // 8 color schemes available
      type: 'scaled', // 'default' | 'mono' | 'scaled'
    }
  },
})
```

### Nuxt Configuration
**File**: `nuxt.config.ts`

Key settings:
- **SSR**: Disabled (SPA mode)
- **Modules**:
  - shadcn-nuxt
  - @vueuse/nuxt
  - @nuxt/eslint
  - @pinia/nuxt
  - @nuxtjs/color-mode
  - @nuxt/fonts
- **Components**: Auto-imported from `~/components/ui`
- **Routing**: Automatic from `~/pages` directory

### TailwindCSS
**File**: `tailwind.config.ts`

Features:
- 4.0+ with Vite plugin
- Custom theme colors
- Dark mode support
- Responsive utilities

---

## 📝 Recent Enhancements

### MailCompLayout.vue Improvements
✅ Client-side athlete and status filtering
✅ Functional search across name, email, status
✅ Protected resend button for "Processing" status
✅ Fixed v-for key binding for proper DOM updates
✅ Improved badge styling and pagination

### AgendaCalendar.vue Improvements
✅ Comprehensive form validation
✅ Required field checking (title, athlete, category, duration, target RPE)
✅ Special validation for Test events
✅ Save button disabled when form invalid
✅ Detailed error messages listing missing fields
✅ Fixed TypeScript errors with String() coercion

### RpeDetailsCmp.vue UX Improvements
✅ Athlete filtering dropdown in header
✅ Loading skeleton placeholders
✅ Emoji annotations for quick scanning
✅ Improved card design with RPE color integration
✅ Empty state messaging when no data
✅ Clear pagination and load-more functionality
✅ Better layout separation between grid and history views

---

## 🔒 Security & Best Practices

- ✅ Type-safe API integration with TypeScript
- ✅ Environment variable configuration
- ✅ Form validation on client and (assumed) server
- ✅ Auth middleware for protected routes
- ✅ Toast notifications for user feedback
- ✅ Error boundary handling
- ✅ Loading states to prevent duplicate submissions

---

## 🛡️ Data Privacy & GDPR Compliance

### Overview
Since **Athlete Hub** handles sensitive personal and health-related data, you must implement strict data protection measures to comply with **GDPR** (EU), **CCPA** (California), and other privacy regulations.

### 1. Legal Foundation

#### Data Controller Responsibilities
- **Define your role**: Are you the data controller or processor?
- **Legal basis**: Obtain explicit consent for data collection (Article 6 GDPR)
- **Privacy Policy**: Create a detailed privacy notice explaining:
  - What data you collect
  - How long you store it
  - Who has access
  - User rights (access, deletion, portability)
- **Terms of Service**: Include data handling clauses
- **Data Processing Agreement (DPA)**: If using third-party services (cloud hosting, email, analytics)

### 2. Consent & Transparency

#### Explicit Consent
```typescript
// Users must explicitly consent to:
// ✅ Personal data collection (name, email, contact)
// ✅ Health/performance data (RPE, injury history, measurements)
// ✅ Cookies & tracking (if applicable)
// ✅ Third-party sharing (if applicable)
```

#### Implementation Tips
- Add a **consent banner** on first visit
- Use **checkbox consent** (not pre-checked)
- Store consent records with timestamp
- Allow users to **withdraw consent anytime**
- Log all consent changes in audit trail

### 3. Data Minimization

Only collect data you actually need:

```typescript
// ✅ COLLECT
- Athlete name, email, phone
- Physical measurements (for training purposes)
- RPE & performance metrics
- Injury/health data (with consent)

// ❌ AVOID COLLECTING
- Religion, political views, race
- Biometric data (unless explicitly consented)
- Financial information (unless necessary)
- Unnecessary demographic data
```

### 4. Data Security Implementation

#### Backend Best Practices
```typescript
// 1. Database Encryption
- Use encrypted database connections (SSL/TLS)
- Enable database-level encryption (e.g., PostgreSQL pgcrypto)
- Encrypt sensitive fields at rest:
  - SSN/ID numbers
  - Health data
  - Payment information

// 2. API Security
- Validate & sanitize all inputs
- Use HTTPS/TLS for all connections
- Implement rate limiting on auth endpoints
- Add CSRF protection
- Use strong authentication (JWT with expiry)

// 3. Access Control
- Implement role-based access (RBAC)
- Principle of least privilege
- Restrict coach access to their own athletes
- Audit all data access with timestamps

// 4. Data Hashing & Encryption
const crypto = require('crypto');

// Hash sensitive data
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Encrypt sensitive fields
function encryptField(data, key) {
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}
```

#### Frontend Security
- Never log sensitive data to console in production
- Use `Content-Security-Policy` headers
- Implement session timeout (15-30 minutes idle)
- Clear sensitive data from memory on logout
- Use secure cookies (HttpOnly, Secure, SameSite flags)

### 5. Data Retention Policy

Define how long you keep data:

```typescript
// Example policy
const retentionPolicy = {
  athleteProfile: '5 years',        // Keep active + 3 years after departure
  rpeData: '2 years',                // Keep for analysis/trend
  trainingLogs: '2 years',           // Historical tracking
  injuryRecords: '5-10 years',       // Legal requirement
  deletedAccounts: '30 days',        // Backup retention before permanent delete
  auditLogs: '1 year',               // Compliance tracking
}
```

**Implementation**:
- Add `createdAt` and `deletedAt` timestamps to all records
- Implement automated data deletion/archival jobs
- Create scheduled cleanup tasks
- Document retention in Privacy Policy

### 6. User Rights Implementation

#### Data Subject Rights (GDPR Articles 12-23)

```typescript
// 1. Right of Access
// Allow users to download their personal data
GET /api/user/data-export
// Returns: All personal & health data in JSON/CSV format

// 2. Right to Rectification
// Allow users to correct their information
PUT /api/user/{id}/profile
// Update name, contact info, etc.

// 3. Right to Erasure ("Right to be forgotten")
DELETE /api/user/{id}
// Implement hard delete (pseudonymize if needed for legal requirements)
// Keep minimal audit trail only

// 4. Right to Data Portability
GET /api/user/{id}/export-portable
// Export in standard format (CSV, JSON)

// 5. Right to Restrict Processing
// Allow users to request data processing suspension
PUT /api/user/{id}/restrict-processing
```

#### Implementation Tips
- Create admin endpoints for data export/deletion
- Log all data access requests
- Implement a 30-day grace period before deletion (for recovery)
- Send confirmation emails for sensitive operations
- Keep audit trail of deletions

### 7. Audit Logging & Monitoring

```typescript
// Log all sensitive operations
interface AuditLog {
  timestamp: Date
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT'
  userId: number
  resourceType: 'ATHLETE' | 'RPE' | 'INJURY' | 'MEASUREMENT'
  resourceId: number
  changes: Record<string, any>  // What changed
  ipAddress: string
  userAgent: string
  consentStatus?: boolean
}

// Store in secure audit table
// Keep for minimum 1 year
// Make immutable (no manual updates)
// Generate monthly compliance reports
```

### 8. Third-Party Tools & Processors

When using external services (email, hosting, analytics), ensure:

```typescript
// ✅ Requirements
- Signed Data Processing Agreements (DPA)
- EU-US Data Transfer compliance (Standard Contractual Clauses)
- Regular security audits
- Breach notification within 24-72 hours
- Personal data encryption
- Limited data access

// Popular compliant services
Services: {
  Hosting: 'AWS, Google Cloud, Azure (with EU regions)',
  Email: 'SendGrid, Mailgun (with EU servers)',
  Analytics: 'Matomo (self-hosted), Plausible',
  CDN: 'Cloudflare (with EU-compliant settings)',
  Backups: 'AWS S3 with encryption'
}
```

### 9. Security Checklist

```markdown
## Pre-Launch Checklist

### Legal
- [ ] Privacy Policy written & accessible
- [ ] Terms of Service with data clauses
- [ ] Data Processing Agreements with 3rd parties
- [ ] Consent mechanism implemented
- [ ] GDPR/CCPA compliance assessment done
- [ ] Legal review completed

### Technical
- [ ] HTTPS/TLS everywhere
- [ ] Database encryption at rest
- [ ] Sensitive field encryption
- [ ] Input validation & sanitization
- [ ] CSRF & XSS protection
- [ ] Rate limiting on auth endpoints
- [ ] Session timeout implemented
- [ ] Secrets in environment variables (not in code)
- [ ] SQL injection prevention (parameterized queries)
- [ ] DDoS protection (if applicable)

### Access Control
- [ ] Role-based access implemented (RBAC)
- [ ] Audit logging for all data access
- [ ] Secure password hashing (bcrypt/argon2)
- [ ] Multi-factor authentication (optional)
- [ ] API key rotation mechanism

### Data Management
- [ ] Data retention policy defined
- [ ] Automated deletion/archival configured
- [ ] Data export functionality
- [ ] Right to be forgotten process
- [ ] Breach response plan

### Monitoring
- [ ] Error logging (non-sensitive)
- [ ] Security alerts configured
- [ ] Regular security audits scheduled
- [ ] Penetration testing planned
```

### 10. Recommended Additional Measures

```typescript
// 1. Email Verification
// Verify athlete emails before sending sensitive data

// 2. Two-Factor Authentication (2FA)
// For coaches accessing sensitive data

// 3. Consent & Preference Center
// Allow athletes to manage:
//   - Which coaches see their data
//   - Which metrics to share
//   - Communication preferences
//   - Data retention preferences

// 4. Data Breach Response Plan
IF (dataBreachDetected) {
  1. Isolate systems (60 minutes)
  2. Notify stakeholders (24 hours)
  3. Assess scope (72 hours for disclosure)
  4. Document incident
  5. Improve security
  6. Legal counsel involved
}

// 5. Annual Security Audit
- Penetration testing
- Code security review
- Compliance assessment
- Control testing

// 6. Staff Training
- Data protection awareness
- Secure coding practices
- Privacy by design
```

### 11. Recommended Privacy Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Argon2/bcrypt** | Password hashing | Use instead of MD5/SHA-1 |
| **TweetNaCl.js** | Field encryption | For sensitive data encryption |
| **OWASP ZAP** | Security scanning | Free vulnerability testing |
| **Snyk** | Dependency scanning | Find vulnerable packages |
| **Cloudflare** | DDoS & WAF protection | Enterprise security |
| **Auth0** | Identity management | OAuth/OIDC compliance |
| **Vault (HashiCorp)** | Secrets management | Secure credential storage |

### 12. Documentation Template

Create a **Data Protection Impact Assessment (DPIA)** document:

```markdown
# Data Protection Impact Assessment - Athlete Hub

## 1. Processing Description
What data do you process?
Who has access?
What is the legal basis?

## 2. Necessity & Proportionality
Is this data necessary for the service?
Can you achieve the same result with less data?

## 3. Risk Assessment
What are the risks of data breach?
What are the consequences for athletes?
What is the likelihood?

## 4. Mitigation Measures
What security controls are in place?
How do they reduce risk?
What monitoring is in place?

## 5. Compliance Measures
Is GDPR/CCPA compliance met?
What consent mechanisms are used?
How is audit logging implemented?
```

---

## Resources & References

### GDPR Compliance
- [Official GDPR Guide](https://gdpr.eu/)
- [European Commission FAQ](https://ec.europa.eu/info/law/law-topic/data-protection_en)
- [CNIL (France) Guidelines](https://www.cnil.fr/en)
- [ICO (UK) Data Protection](https://ico.org.uk/for-organisations/gdpr/)

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)

### Privacy By Design
- [Privacy International](https://privacyinternational.org/)
- [EFF Resources](https://www.eff.org/)

---

## 🤝 Contributing

1. **Create a feature branch**: `git checkout -b feature/amazing-feature`
2. **Commit changes**: `git commit -m 'Add amazing feature'`
3. **Push to branch**: `git push origin feature/amazing-feature`
4. **Open a Pull Request**

### Code Quality
- Run `pnpm run lint` before committing
- Run `pnpm run typecheck` to verify types
- Follow Nuxt and Vue 3 best practices

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Manuel Enzo**
📧 [manuelenzo2000@gmail.com](mailto:manuelenzo2000@gmail.com)
🔗 [GitHub](https://github.com/dianprata)

---

## 🙏 Credits

- [Nuxt.js](https://nuxtjs.org/) - The Intuitive Vue Framework
- [Vue.js 3](https://vuejs.org/) - Progressive JavaScript Framework
- [Shadcn Vue](https://shadcn-vue.com/) - High Quality Vue Components
- [TailwindCSS](https://tailwindcss.com/) - Utility-First CSS Framework
- [Pinia](https://pinia.vuejs.org/) - State Management
- [Lucide Icons](https://lucide.dev/) - Beautiful Icons

---

## 📞 Support

For support, email [athletehub.sport@gmail.com](mailto:athletehub.sport@gmail.com) or open an issue on GitHub.

---

**Last Updated**: February 24, 2026

**Version**: 1.0.2
