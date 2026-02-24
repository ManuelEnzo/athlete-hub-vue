# 🔐 Data Privacy Implementation Guide

> Practical guide to implementing GDPR/CCPA compliance in Athlete Hub

---

## Quick Start Checklist

- [ ] Add Privacy Policy page
- [ ] Implement consent banner
- [ ] Add data export endpoint
- [ ] Add user deletion endpoint
- [ ] Implement audit logging
- [ ] Encrypt sensitive fields
- [ ] Add 2FA (optional)
- [ ] Create DPA with 3rd parties
- [ ] Set data retention policy
- [ ] Schedule security audit

---

## 1. Privacy Policy Page

Create `pages/privacy.vue`:

```vue
<script setup>
definePageMeta({
  layout: 'blank' // No auth required
})
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">Privacy Policy</h1>

    <div class="prose prose-sm max-w-none">
      <h2>1. Data We Collect</h2>
      <p>Personal information (name, email, phone)</p>
      <p>Health & performance data (RPE, measurements, injuries)</p>
      <p>System usage logs (IP, user agent, timestamps)</p>

      <h2>2. Legal Basis (GDPR)</h2>
      <p><strong>Article 6(1)(a):</strong> Your explicit consent</p>
      <p><strong>Article 9(2)(a):</strong> Health data with written consent</p>

      <h2>3. Your Rights</h2>
      <ul>
        <li>✅ Right of Access - Download your data</li>
        <li>✅ Right to Rectification - Correct your information</li>
        <li>✅ Right to Erasure - Delete your account</li>
        <li>✅ Right to Portability - Export data in standard format</li>
        <li>✅ Right to Restrict Processing - Pause data processing</li>
      </ul>

      <h2>4. Data Retention</h2>
      <table>
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Retention Period</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Athlete Profile</td>
            <td>5 years after account deletion</td>
          </tr>
          <tr>
            <td>RPE & Performance</td>
            <td>2 years</td>
          </tr>
          <tr>
            <td>Injury Records</td>
            <td>5 years (legal requirement)</td>
          </tr>
          <tr>
            <td>Audit Logs</td>
            <td>1 year (compliance)</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Data Security</h2>
      <p>{{-- Add your security measures --}}</p>
      <ul>
        <li>Encrypted database connections (TLS 1.3)</li>
        <li>Field-level encryption for sensitive data</li>
        <li>Secure password hashing (Argon2)</li>
        <li>Regular security audits</li>
        <li>24/7 monitoring & alerting</li>
      </ul>

      <h2>6. Contact & Rights Requests</h2>
      <p>For privacy inquiries: <strong>privacy@yourdomain.com</strong></p>
      <p>Data controller: Your Company Name</p>
      <p>Response time: Within 30 days of request</p>
    </div>
  </div>
</template>
```

---

## 2. Consent Banner

Create `components/ConsentBanner.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const consentGiven = useLocalStorage('athlete_hub_consent', false)
const showBanner = ref(!consentGiven.value)

const acceptConsent = () => {
  consentGiven.value = true
  showBanner.value = false

  // Log consent to backend
  logConsent({
    action: 'CONSENT_ACCEPTED',
    timestamp: new Date().toISOString(),
    version: '1.0'
  })

  // Enable analytics, tracking, etc.
  useAnalytics().enable()
}

const openPrivacyPolicy = () => {
  navigateTo('/privacy')
}
</script>

<template>
  <div v-if="showBanner"
    class="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-2xl z-50">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-4">
      <div class="flex-1">
        <p class="text-sm font-semibold mb-1">
          🔒 We respect your privacy
        </p>
        <p class="text-xs text-muted-foreground">
          We use cookies and collect personal data to improve your experience.
          <button
            @click="openPrivacyPolicy"
            class="underline text-primary hover:text-primary/80">
            Read our Privacy Policy
          </button>
        </p>
      </div>
      <button
        @click="acceptConsent"
        class="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold whitespace-nowrap">
        Accept & Continue
      </button>
    </div>
  </div>
</template>
```

---

## 3. Audit Logging

Create `server/utils/auditLog.ts`:

```typescript
import { defineEventHandler } from 'h3'
import { log } from '~/server/db'

export interface AuditLog {
  timestamp: Date
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'AUTH'
  userId?: number
  resourceType?: 'ATHLETE' | 'RPE' | 'INJURY' | 'USER' | 'CONSENT'
  resourceId?: number
  changes?: Record<string, any>
  ipAddress: string
  userAgent: string
  status: 'SUCCESS' | 'FAILURE'
  errorMessage?: string
}

/**
 * Log sensitive operations for compliance
 */
export async function auditLog(log: Omit<AuditLog, 'timestamp' | 'ipAddress' | 'userAgent'>, event: any) {
  const audit: AuditLog = {
    ...log,
    timestamp: new Date(),
    ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '',
    userAgent: getHeader(event, 'user-agent') || ''
  }

  // Store in database
  await prisma.auditLog.create({
    data: audit
  })

  // Also log to external service (e.g., Datadog, CloudWatch)
  console.log(`[AUDIT] ${audit.action} on ${audit.resourceType}/${audit.resourceId} by user ${audit.userId}`)
}

// Middleware to auto-log API calls
export function createAuditMiddleware() {
  return defineEventHandler(async (event) => {
    const startTime = Date.now()

    // Get current user from token
    const auth = await verifyAuth(event)

    // Continue with handler
    try {
      const result = await event

      // Log successful operation
      await auditLog({
        action: getActionFromMethod(event.method || 'GET'),
        userId: auth?.userId,
        resourceType: extractResourceType(event.path),
        resourceId: extractResourceId(event.path),
        status: 'SUCCESS'
      }, event)

      return result
    } catch (error) {
      // Log failed operation
      await auditLog({
        action: getActionFromMethod(event.method || 'GET'),
        userId: auth?.userId,
        resourceType: extractResourceType(event.path),
        status: 'FAILURE',
        errorMessage: error?.message
      }, event)

      throw error
    }
  })
}

function getActionFromMethod(method: string) {
  if (method === 'GET') return 'READ'
  if (method === 'POST') return 'CREATE'
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE'
  if (method === 'DELETE') return 'DELETE'
  return 'READ'
}

function extractResourceType(path: string): string {
  const parts = path.split('/')
  return parts[2]?.toUpperCase() ?? 'UNKNOWN'
}

function extractResourceId(path: string): number | undefined {
  const match = path.match(/\/(\d+)/)
  return match ? parseInt(match[1]) : undefined
}
```

---

## 4. Data Export Endpoint

Create `server/api/user/export-data.get.ts`:

```typescript
import { defineEventHandler } from 'h3'
import { parse } from 'json2csv'

export default defineEventHandler(async (event) => {
  const auth = await verifyAuth(event)
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  // Log export request
  await auditLog({
    action: 'EXPORT',
    userId: auth.userId,
    resourceType: 'USER',
    resourceId: auth.userId,
    status: 'SUCCESS'
  }, event)

  // Fetch all user data
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: auth.userId },
    include: {
      athletes: {
        include: {
          rpeData: true,
          injuries: true,
          measurements: true
        }
      },
      auditLogs: true
    }
  })

  // Prepare export in multiple formats
  const exportData = {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    },
    athletes: user.athletes,
    exportDate: new Date().toISOString()
  }

  // Set response headers
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Content-Disposition', `attachment; filename="my-data-${Date.now()}.json"`)

  return exportData
})
```

---

## 5. User Deletion Endpoint

Create `server/api/user/delete.delete.ts`:

```typescript
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const auth = await verifyAuth(event)
  if (!auth) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const { password, confirmDelete } = await readBody(event)

  // Verify password for security
  const user = await prisma.user.findUniqueOrThrow({ where: { id: auth.userId } })
  const passwordValid = await verifyPassword(password, user.passwordHash)

  if (!passwordValid) {
    throw createError({ statusCode: 403, statusMessage: 'Invalid password' })
  }

  if (confirmDelete !== true) {
    throw createError({ statusCode: 400, statusMessage: 'Deletion not confirmed' })
  }

  // Log deletion request
  await auditLog({
    action: 'DELETE',
    userId: auth.userId,
    resourceType: 'USER',
    resourceId: auth.userId,
    status: 'SUCCESS'
  }, event)

  // Schedule soft delete (30-day grace period)
  await prisma.user.update({
    where: { id: auth.userId },
    data: {
      deletedAt: new Date(),
      email: `deleted-${auth.userId}-${Date.now()}@deleted.local` // Pseudonymize
    }
  })

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId: auth.userId }
  })

  // Schedule hard delete after 30 days
  scheduleHardDelete(auth.userId, 30) // days

  return { success: true, message: 'Account scheduled for deletion in 30 days' }
})

// Scheduled job (run daily)
export async function deleteExpiredAccounts() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const usersToDelete = await prisma.user.findMany({
    where: {
      deletedAt: { lt: thirtyDaysAgo }
    }
  })

  for (const user of usersToDelete) {
    // Remove all personal data
    await prisma.$transaction([
      prisma.athlete.deleteMany({ where: { coachId: user.id } }),
      prisma.rpeData.deleteMany({ where: { coach: { id: user.id } } }),
      prisma.user.delete({ where: { id: user.id } })
    ])

    console.log(`[GDPR] Permanently deleted user ${user.id}`)
  }
}
```

---

## 6. Encrypted Fields (Database)

Setup field-level encryption for sensitive data:

```typescript
// Schema with encrypted fields
model Athlete {
  id        Int     @id @default(autoincrement())
  name      String  // Encrypted
  email     String  // Encrypted
  phone     String? // Encrypted
  ssn       String? // Encrypted

  // Encryption metadata
  encryptionVersion Int @default(1)

  rpeData   RpeData[]
  injuries  Injury[]
}

// Encryption utility
import { TweetNaCl } from 'tweetnacl.js'

export class FieldEncryption {
  private key: Buffer

  constructor(masterKey: string) {
    // Derive key from master key
    this.key = Buffer.from(masterKey)
  }

  encrypt(plaintext: string): string {
    const nonce = TweetNaCl.randomBytes(24)
    const box = TweetNaCl.secretbox(
      Buffer.from(plaintext),
      nonce,
      this.key
    )

    return Buffer.concat([nonce, box]).toString('base64')
  }

  decrypt(ciphertext: string): string {
    const buffer = Buffer.from(ciphertext, 'base64')
    const nonce = buffer.slice(0, 24)
    const box = buffer.slice(24)

    const plaintext = TweetNaCl.secretbox.open(box, nonce, this.key)
    return Buffer.from(plaintext).toString('utf-8')
  }
}

// Use in Prisma middleware
const encryption = new FieldEncryption(process.env.ENCRYPTION_KEY!)

prisma.$use(async (params, next) => {
  // Encrypt on write
  if (params.action === 'create' || params.action === 'update') {
    if (params.data?.email) params.data.email = encryption.encrypt(params.data.email)
    if (params.data?.phone) params.data.phone = encryption.encrypt(params.data.phone)
  }

  const result = await next(params)

  // Decrypt on read
  if (params.action === 'findUnique' || params.action === 'findMany') {
    if (result?.email) result.email = encryption.decrypt(result.email)
    if (result?.phone) result.phone = encryption.decrypt(result.phone)
  }

  return result
})
```

---

## 7. Two-Factor Authentication (Optional)

Create `server/api/auth/setup-2fa.post.ts`:

```typescript
import { defineEventHandler } from 'h3'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const auth = await verifyAuth(event)
  if (!auth) throw createError({ statusCode: 401 })

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `AthleteHub (${auth.email})`,
    issuer: 'AthleteHub'
  })

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  return {
    secret: secret.base32,
    qrCode,
    message: 'Scan with Google Authenticator or Authy'
  }
})
```

---

## 8. Data Retention Job

Create `server/cron/cleanup-old-data.ts`:

```typescript
// Run daily at 2 AM
export async function cleanupOldData() {
  const now = new Date()

  // Delete RPE data older than 2 years
  await prisma.rpeData.deleteMany({
    where: {
      createdAt: {
        lt: new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)
      }
    }
  })

  // Archive audit logs older than 1 year
  await prisma.auditLog.updateMany({
    where: {
      timestamp: {
        lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      }
    },
    data: { archived: true }
  })

  console.log('[CRON] Data cleanup completed')
}
```

---

## 9. DPA with Third Parties

**Template for Data Processing Addendum:**

```markdown
# Data Processing Addendum (DPA)

This DPA is entered into between:
- **Data Controller**: Your Company
- **Data Processor**: [Third Party Name]

## 1. Scope of Processing
- Personal data: Names, emails, health data
- Processing: Email delivery, hosting, analytics
- Duration: As long as service is active
- Categories of data subjects: Athletes, coaches

## 2. Subject Matter & Duration
- Purpose: Deliver services in AthleteHub
- Duration: Contract term + retention period
- Nature of processing: Storage, transmission, analysis

## 3. Processor Obligations
- Process data only on instructions
- Ensure data security (encryption, access control)
- Implement technical & organizational measures
- Apply same security standards as controller
- Sub-processor approval required
- Data breach notification within 24 hours
- Assist with audit & inspection
- Return/delete data upon contract termination

## 4. Data Subject Rights
- Processor will assist with Right of Access requests
- Processor will assist with deletion/portability
- Response time: Within 30 days

## 5. Sub-processors
Current sub-processors:
- AWS (Hosting)
- SendGrid (Email)
- Stripe (Payments)

## Signed __/__/____
```

---

## 10. Compliance Monitoring

Create compliance dashboard:

```vue
<script setup>
const complianceStatus = computed(() => ({
  gdprCompliance: {
    privacyPolicy: ✅,
    consentBanner: ✅,
    dataExport: ✅,
    dataDelete: ✅,
    auditLogging: ✅,
    dpaWithVendors: 🟡, // In progress

  },
  dataSecurityIncidents: [
    // Track incidents
  ],
  pendingDeleteRequests: 3, // Users awaiting deletion
  expiringDPAs: [], // Contracts to renew
  lastAudit: '2026-01-15',
  nextAuditDue: '2026-04-15'
}))
</script>
```

---

## Commands to Run

```bash
# Start audit logging middleware
npm run setup:audit-logging

# Schedule daily cleanup job
npm run setup:cron:cleanup

# Test encryption
npm run test:encryption

# Generate compliance report
npm run compliance:report

# Run security audit
npm run security:audit

# Test GDPR endpoints
npm run test:gdpr:export
npm run test:gdpr:delete
```

---

## Resources

- [GDPR Official Guide](https://gdpr.eu/)
- [OWASP Secure Coding](https://owasp.org/)
- [Encryption Libraries](https://libsodium.gitbook.io/)

---

**Remember**: Privacy is not a one-time thing. It requires ongoing monitoring, audits, and updates as regulations evolve.
