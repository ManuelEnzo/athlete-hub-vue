# 📊 Advanced Dashboard System - Complete Integration Guide

## Overview

The Advanced Dashboard System is a production-grade analytics platform for the Athlete-Hub application. It provides real-time monitoring, AI-powered insights, advanced filtering, and comprehensive performance analysis for coaching teams.

## 🏗️ Architecture

### Layer 1: Components (UI Layer)
- **DashboardLayout.vue** - Main dashboard container with navigation and layout
- **ReadinessWidget.vue** - Team readiness visualization
- **RiskAssessmentWidget.vue** - Injury risk analysis
- **WorkloadAnalysisWidget.vue** - Training load monitoring
- **PerformanceTrendsWidget.vue** - Performance forecasting
- **TeamComparisonWidget.vue** - Athlete comparative analysis
- **AIInsightsWidget.vue** - AI-powered insights display
- **HealthAssessment.vue** - Individual athlete health metrics
- **AdvancedFilterModal.vue** - Advanced multi-criteria filtering
- **DashboardSettings.vue** - User preferences and customization

### Layer 2: State Management (Pinia)
- **dashboardStore.ts** - Dashboard state, polling, auto-refresh
- **athletesStore.ts** - Athletes data, pagination, filtering
- **notificationStore.ts** - Global notifications and alerts

### Layer 3: Services (Business Logic)
- **dataService.ts** - Centralized API calls with retry logic, caching
- **aiInsightsService.ts** - AI prediction engine

### Layer 4: Composables (Reusable Logic)
- **useDashboardComposables.ts** - 7 composables:
  - `useChartOptions()` - ApexCharts configuration
  - `useHealthMetrics()` - Health score calculations
  - `useWorkloadAnalysis()` - Workload metrics
  - `usePerformanceForecast()` - Performance predictions
  - `useRealtimeUpdates()` - Real-time data monitoring
  - `useDataFormatting()` - Number/date formatting
  - `useRiskAssessment()` - Risk calculations

### Layer 5: Configuration (Centralized Config)
- **dashboardConfig.ts** - 350+ lines of configuration:
  - METRICS - 8 metric definitions
  - DASHBOARD_WIDGETS - 8 widget specifications
  - TIME_RANGES - 5 preset time ranges
  - DEFAULT_ALERT_RULES - 4 critical alert rules
  - SEVERITY_LEVELS - Color/icon mapping
  - DEFAULT_LAYOUT - Grid layout configuration

## 📋 File Mapping

```
app/
├── components/dashboard/
│   ├── DashboardLayout.vue          ✓ Main dashboard container
│   ├── ReadinessWidget.vue          ✓ Readiness visualization
│   ├── RiskAssessmentWidget.vue     ✓ Risk analysis
│   ├── WorkloadAnalysisWidget.vue   ✓ Workload monitoring
│   ├── PerformanceTrendsWidget.vue  ✓ Performance trends
│   ├── TeamComparisonWidget.vue     ✓ Athlete comparison
│   ├── AIInsightsWidget.vue         ✓ AI insights
│   ├── HealthAssessment.vue         ✓ Health metrics
│   ├── AdvancedFilterModal.vue      ✓ Advanced filtering
│   ├── DashboardSettings.vue        ✓ Settings modal
│   ├── MetricCard.vue               ✓ Metric display card
│   ├── NotificationCenter.vue       ✓ Notification management
│   └── DashboardCard.vue            ✓ Generic card component
│
├── composables/
│   ├── useDashboardComposables.ts   ✓ 7 utility composables
│   └── dashboard/
│       └── index.ts                 ✓ Centralized exports
│
├── api/
│   ├── client.ts                    ✓ Data service layer
│   ├── aiInsightsService.ts         ✓ AI engine
│   ├── auth.ts
│   └── business.ts
│
├── stores/
│   ├── dashboard.ts                 ✓ Dashboard state
│   ├── athletes.ts                  ✓ Athletes data
│   └── notificationStore.ts         ✓ Notifications
│
├── config/
│   └── dashboardConfig.ts           ✓ Centralized config
│
└── pages/
    └── dashboard.vue                (see integration below)
```

## 🚀 Integration Steps

### Step 1: Import DashboardLayout in Dashboard Page

File: `app/pages/dashboard.vue`

```vue
<script setup lang="ts">
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
</script>

<template>
  <DashboardLayout />
</template>
```

### Step 2: Update NuxtLayout (Optional)

If using a custom layout wrapper:

```vue
<template>
  <div class="h-screen bg-background">
    <DashboardLayout />
  </div>
</template>
```

### Step 3: Ensure Store Initialization

File: `app/stores/dashboard.ts` should have:

```typescript
export const useDashboardStore = defineStore('dashboard', () => {
  const initialize = async () => {
    // Load initial data
  }

  const refresh = async () => {
    // Refresh all data
  }

  return { initialize, refresh }
})
```

### Step 4: Configure API Endpoints

File: `app/api/client.ts` should export:

```typescript
export const dataService = {
  getCoachDashboard: async () => { /* ... */ },
  getAthletes: async () => { /* ... */ }
}
```

## 📊 Widget Integration Pattern

All widgets follow this pattern:

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDashboardStore } from '~/stores/dashboard'

const dashboardStore = useDashboardStore()
const isLoading = ref(false)

// Computed data from store
const displayData = computed(() => {
  return dashboardStore.data?.athletes || []
})

// Auto-refresh
onMounted(() => {
  // Initial load + interval
})
</script>
```

## 🔄 Data Flow

```
User Action
    ↓
DashboardLayout (top-level state)
    ↓
dashboardStore.refresh() ← dataService.getCoachDashboard()
    ↓
Individual Widgets (consume store)
    ↓
AdvancedFilterModal → dashboardStore.setFilter()
    ↓
Store re-computed, widgets re-render
```

## 💡 Key Features

### 1. Real-Time Data
- Auto-refresh every 5 minutes
- Manual refresh available
- Polling with configurable interval
- Real-time monitoring composable

### 2. Advanced Filtering
- Multi-select athletes
- Date range picker
- Metric range sliders
- Preset saving/loading
- Filter state emission to parent

### 3. AI Insights
- Low readiness detection
- Fatigue pattern analysis
- Workload spike detection
- Injury risk assessment
- 7-day performance trends
- Anomaly detection

### 4. Data Visualization
- Team readiness overview
- Distribution charts
- Comparison bar charts
- Trend analysis
- Performance forecasting

### 5. Risk Management
- Injury risk scoring
- Overtraining detection
- Fatigue monitoring
- Alerts and notifications

### 6. Performance Analysis
- Individual metrics
- Team comparisons
- Percentile calculations
- Top/bottom performers

## 🎨 Theming

All components support dark/light mode via Tailwind CSS classes:
- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-muted` / `text-muted-foreground`
- `border-border`

## 🔧 Configuration Examples

### Change Refresh Interval

File: `app/config/dashboardConfig.ts`

```typescript
export const DASHBOARD_WIDGETS = [
  {
    id: 'readiness',
    component: 'ReadinessWidget',
    refreshInterval: 300000, // 5 minutes → Change this
    size: 'large'
  }
]
```

### Add Alert Rule

```typescript
export const DEFAULT_ALERT_RULES = [
  {
    metric: 'customMetric',
    threshold: 75,
    severity: 'warning',
    action: 'notify'
  }
]
```

### Customize Metrics

```typescript
export const METRICS = [
  {
    id: 'newMetric',
    label: 'New Metric',
    unit: '%',
    thresholds: { low: 30, high: 80 }
  }
]
```

## 📱 Responsive Behavior

Dashboard uses a 12-column grid system:

- **Mobile (< 640px)**: Single column
- **Tablet (640px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: Full responsive grid

## 🧪 Testing

### Unit Tests Pattern

```typescript
describe('DashboardLayout', () => {
  it('should initialize on mount', async () => {
    const wrapper = mount(DashboardLayout)
    await nextTick()
    expect(dashboardStore.data).toBeDefined()
  })
})
```

### E2E Tests Pattern

```typescript
describe('Dashboard E2E', () => {
  it('should filter athletes and refresh widgets', () => {
    cy.visit('/dashboard')
    cy.contains('Advanced Filter').click()
    cy.get('[data-test="filter-modal"]').should('be.visible')
  })
})
```

## 🚨 Error Handling

### Service Layer

All API calls are wrapped in try-catch with retry logic:

```typescript
// dataService retries 3 times before failing
const data = await dataService.getCoachDashboard()
```

### Component Level

All widgets have loading and error states:

```vue
<div v-if="isLoading">
Loading...
</div>

<div v-else-if="error">
Error: {{ error }}
</div>

<div v-else>
Content
</div>
```

### Global Notifications

Use notificationStore for user feedback:

```typescript
notificationStore.addNotification({
  title: 'Error',
  message: 'Failed to load data',
  type: 'error'
})
```

## 🔐 Security Notes

1. **API Auth**: All data service calls use stored JWT token
2. **CORS**: Configured in nuxt.config.ts
3. **Data Sanitization**: User inputs are sanitized before API calls
4. **Rate Limiting**: dataService respects API rate limits

## 📈 Performance Optimization

1. **Virtual Scrolling**: Used in athlete lists (>100 items)
2. **Lazy Loading**: Widgets load independently
3. **Request Caching**: Implemented in dataService
4. **Request Deduplication**: Multiple identical requests consolidated
5. **Pagination**: Athletes store supports pagination

## 🔗 API Endpoints Expected

The system expects these endpoints:

```
GET /api/coach/dashboard
  Returns: CoachDashboardSummaryDto

GET /api/athletes
  Returns: AthleteResponse[]

GET /api/athletes/{id}
  Returns: AthleteResponse

POST /api/athletes/filter
  Body: FilterState
  Returns: AthleteResponse[]
```

## 📚 Type Definitions

Key types in `app/types/api.ts`:

```typescript
interface CoachDashboardSummaryDto {
  athletes: AthleteResponse[]
  workload: WorkloadData
  readiness: ReadinessData
  performance: PerformanceData
}

interface AthleteResponse {
  id: string
  name: string
  readinessScore: number
  fatigueScore: number
  sorenessScore: number
  sleepHours: number
  recentWorkload: number
  acwr: number
}

interface FilterState {
  athletes: string[]
  dateRange: [Date, Date]
  metrics: {
    readiness: [number, number]
    workload: [number, number]
    fatigue: [number, number]
    soreness: [number, number]
  }
}
```

## 🎯 Next Steps

1. ✅ All widget components created
2. ✅ State management configured
3. ✅ Service layer implemented
4. ✅ Composables ready for use
5. 📝 Create dashboard.vue page that imports DashboardLayout
6. 📝 Verify API endpoints match expected structure
7. 📝 Test on mobile devices
8. 📝 Configure alert thresholds
9. 📝 Set up analytics tracking (optional)
10. 📝 Deploy and monitor performance

## 🆘 Troubleshooting

### Widgets Not Loading
- Check if dashboardStore.initialize() called
- Verify API endpoints return correct data
- Check browser console for errors

### Styling Issues
- Ensure tailwind.css is imported
- Verify theme configuration
- Check CSS class names

### Performance Issues
- Increase refresh interval
- Enable virtual scrolling for large lists
- Check network tab for slow API calls

## 📞 Support

For questions or issues:
1. Check console for error messages
2. Review store state in Vue DevTools
3. Verify API responses in Network tab
4. Check component props/slots
