# 📊 Dashboard Quick Start

## ⚡ 30-Minute Setup

### Step 1: Import Dashboard Component (1 min)

**File:** `app/pages/dashboard.vue`

```vue
<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
</script>

<template>
  <div class="min-h-screen">
    <DashboardLayout />
  </div>
</template>

<style scoped></style>
```

### Step 2: Verify Store Exists (2 min)

Ensure `app/stores/dashboard.ts` has these methods:

```typescript
async function initialize() {
  // Loads initial dashboard data
}

async function refresh() {
  // Refreshes all metrics
}

function setTimeRange(range: string) {
  // Changes time range
}

function setFilter(filter: FilterState) {
  // Applies filter
}
```

### Step 3: Verify API Service (3 min)

Ensure `app/api/client.ts` has:

```typescript
export const dataService = {
  getCoachDashboard: async () => {
    // Call your backend API
    const response = await $fetch('/api/coach/dashboard')
    return response
  }
}
```

### Step 4: Check API Response Format (5 min)

Your API should return this structure:

```typescript
{
  athletes: [
    {
      id: string
      name: string
      readinessScore: number      // 0-100
      fatigueScore: number        // 0-100
      sorenessScore: number       // 0-100
      sleepHours: number          // 0-24
      recentWorkload: number      // 0-500
      acwr: number                // 0-3
      performanceScore?: number   // 0-100
      displayName?: string
    }
  ],
  workload: {
    current: number
    average: number
    maximum: number
    trend: number               // percentage change
  },
  readiness: {
    average: number
    distribution: [number, number, number, number]
  },
  performance: {
    score: number
    trend: {
      change: number
    }
  }
}
```

### Step 5: Test the Dashboard (19 min)

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to /dashboard
# Should see:
# ✅ Navigation bar with title
# ✅ Metric cards (readiness, fatigue, soreness, workload)
# ✅ Readiness widget
# ✅ Risk assessment widget
# ✅ Workload analysis
# ✅ Performance trends
# ✅ Team comparison
# ✅ AI Insights
# ✅ Health assessment

# 3. Test filter button
# Click "Advanced Filter" → Modal opens

# 4. Test settings
# Click Settings icon → Settings modal opens

# 5. Test refresh
# Click refresh icon → Data refreshes
# Check auto-refresh (runs every 5 min)

# 6. Test on mobile
# Resize browser to test responsive layout
```

---

## 🎯 Common Integration Issues & Solutions

### Issue 1: "Cannot find module '@/stores/dashboard'"

**Solution:**
```typescript
// Check that dashboardStore is exported in:
// app/stores/dashboard.ts

export const useDashboardStore = defineStore('dashboard', () => {
  // ... store implementation
})
```

### Issue 2: "API returns undefined"

**Solution:**
Check that your API endpoint exists:
```bash
# Test in curl
curl http://localhost:3000/api/coach/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return JSON matching the structure above
```

### Issue 3: "Widgets show 'Loading...' forever"

**Solution:**
1. Check browser Network tab for failed requests
2. Verify API returns data in correct format
3. Check browser Console for error messages
4. Ensure JWT token is valid

### Issue 4: "Settings modal doesn't open"

**Solution:**
Make sure NotificationCenter.vue exists:
```typescript
import NotificationCenter from '~/components/dashboard/NotificationCenter.vue'
```

---

## 🚀 Quick Configuration

### Change Auto-Refresh Interval

**File:** `app/config/dashboardConfig.ts`

```typescript
// Default: 300000ms (5 minutes)
export const DEFAULT_REFRESH_INTERVAL = 300000

// Change to 2 minutes:
export const DEFAULT_REFRESH_INTERVAL = 120000
```

### Add Custom Metric

**File:** `app/config/dashboardConfig.ts`

```typescript
export const METRICS = [
  // ... existing metrics
  {
    id: 'custom',
    label: 'Custom Metric',
    unit: '%',
    thresholds: {
      low: 20,
      high: 80
    }
  }
]
```

### Change Alert Thresholds

**File:** `app/config/dashboardConfig.ts`

```typescript
export const DEFAULT_ALERT_RULES = [
  {
    metric: 'readiness',
    threshold: 40, // Alert if < 40
    severity: 'critical',
    action: 'notify'
  },
  // ... more rules
]
```

---

## 🟢 Verification Checklist

When you open `/dashboard`, verify:

- [ ] Page loads without errors
- [ ] Metric cards display values
- [ ] All widgets render
- [ ] Filter button works
- [ ] Settings button works
- [ ] Refresh button updates data
- [ ] Auto-refresh happens every 5 min (check JavaScript console)
- [ ] Responsive on mobile (resize browser)
- [ ] No console errors (F12 → Console tab)

---

## 📱 Testing on Different Devices

### Mobile (< 640px)
```bash
# In Chrome DevTools:
# 1. Press F12
# 2. Click device icon (top-left)
# 3. Select "iPhone 12"
# 4. Widgets should stack vertically
```

### Tablet (640px - 1024px)
```bash
# In Chrome DevTools:
# 1. Press F12
# 2. Click device icon
# 3. Select "iPad"
# 4. Should see 2-column layout
```

### Desktop (> 1024px)
```bash
# Full responsive layout with multiple columns
# Optimal viewing experience
```

---

## 🔧 Advanced: Debugging

### Enable Debug Logging

Add to `app/stores/dashboard.ts`:

```typescript
async function refresh() {
  console.log('[Dashboard] Refreshing...')
  const data = await dataService.getCoachDashboard()
  console.log('[Dashboard] Data received:', data)
  // ... rest of refresh logic
}
```

### Check Store State

Press F12 in browser → Install "Vue DevTools" extension → Stores tab → See all data in real-time

### Check Widget Props

Right-click widget → "Inspect Element" → Vue DevTools → see component props

### Monitor API Calls

Press F12 → Network tab → Filter "XHR" → Click refresh → See API calls

---

## 📚 File References

When integrating, make sure these files exist:

```
✅ app/components/dashboard/DashboardLayout.vue
✅ app/components/dashboard/ReadinessWidget.vue
✅ app/components/dashboard/RiskAssessmentWidget.vue
✅ app/components/dashboard/WorkloadAnalysisWidget.vue
✅ app/components/dashboard/PerformanceTrendsWidget.vue
✅ app/components/dashboard/TeamComparisonWidget.vue
✅ app/components/dashboard/AIInsightsWidget.vue
✅ app/components/dashboard/HealthAssessment.vue
✅ app/components/dashboard/AdvancedFilterModal.vue
✅ app/components/dashboard/DashboardSettings.vue
✅ app/components/dashboard/MetricCard.vue
✅ app/components/dashboard/NotificationCenter.vue
✅ app/stores/dashboard.ts
✅ app/api/client.ts (dataService)
✅ app/api/aiInsightsService.ts
✅ app/config/dashboardConfig.ts
✅ app/composables/useDashboardComposables.ts
```

---

## ⚕️ Health Check

Run this in browser console after dashboard loads:

```javascript
// Check if stores are initialized
console.log('dashboardStore.data:', store.data)

// Check if widgets mounted
console.log('Widget count:', document.querySelectorAll('[class*="Widget"]').length)

// Check for errors
console.log('Console errors:', performance.measure)

// Check API response time
// Should be < 1000ms
```

---

## 🎓 What Happens Behind the Scenes

1. **Page Loads** → `DashboardLayout.vue` mounts
2. **onMounted** → Calls `dashboardStore.initialize()`
3. **Initialize** → Fetches data from `/api/coach/dashboard`
4. **Data Arrives** → Store updates, widgets re-render
5. **Auto-Refresh Starts** → Every 5 minutes, refreshes data
6. **User Filters** → `AdvancedFilterModal` emits filter state
7. **Store Updates** → `dashboardStore.setFilter()`
8. **Widgets Consume** → Computed properties recalculate
9. **UI Updates** → Widgets re-render with new data

---

## 🎯 Next Steps After Integration

1. ✅ Run dashboard and verify all widgets load
2. ✅ Test filter functionality
3. ✅ Test on mobile device
4. ✅ Configure refresh interval for your use case
5. ✅ Customize alert thresholds
6. ✅ Test with real athlete data
7. ✅ Monitor performance in production
8. ✅ Gather user feedback
9. ✅ Plan future enhancements (WebSocket, PDF export, etc.)

---

## 💡 Pro Tips

1. **Settings Auto-Save**: User preferences saved to localStorage
2. **Dark Mode**: Automatic based on system preference
3. **Mobile Friendly**: Touch-optimized buttons and spacing
4. **Error Recovery**: Auto-retry failed API requests (3 attempts)
5. **Performance**: Virtual scrolling for large athlete lists
6. **Accessibility**: Keyboard navigation + screen reader support

---

## 🆘 If Something Goes Wrong

```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Note the error
5. Check DASHBOARD_INTEGRATION_GUIDE.md "Troubleshooting" section
6. Or contact team with error message
```

---

**Ready to go!** 🚀 Your dashboard should be live in 30 minutes.
