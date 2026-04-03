/**
 * 🚦 REQUEST THROTTLER
 * Prevents request storms and implements client-side rate limiting
 * Protects backend from being overwhelmed during peak load
 */

export interface ThrottleConfig {
  minInterval: number // Min ms between consecutive requests
  maxRequests: number // Max requests allowed per window
  windowSize: number // Time window in ms
  burstAllowed: number // Allow N requests before throttling
}

const DEFAULT_THROTTLE: ThrottleConfig = {
  minInterval: 500, // Min 500ms between requests for same endpoint
  maxRequests: 100, // Max 100 requests per second
  windowSize: 1000, // Per second
  burstAllowed: 10, // Allow 10 burst requests
}

interface EndpointThrottle {
  lastRequestTime: number
  requestCount: number
  windowStart: number
  burstCount: number
}

class RequestThrottler {
  private endpointThrottles = new Map<string, EndpointThrottle>()
  private globalThrottles = new Map<string, ThrottleConfig>()

  /**
   * Configure throttling for specific endpoints
   */
  setConfig(pattern: string, config: Partial<ThrottleConfig>) {
    this.globalThrottles.set(pattern, {
      ...DEFAULT_THROTTLE,
      ...config,
    })
  }

  /**
   * Check if request can proceed, false if throttled
   */
  canMakeRequest(endpoint: string, config?: Partial<ThrottleConfig>): boolean {
    const cfg = {
      ...DEFAULT_THROTTLE,
      ...this.globalThrottles.get(endpoint),
      ...config,
    }

    const now = Date.now()
    let throttle = this.endpointThrottles.get(endpoint)

    // Initialize or reset expired window
    if (!throttle) {
      throttle = {
        lastRequestTime: 0,
        requestCount: 0,
        windowStart: now,
        burstCount: 0,
      }
      this.endpointThrottles.set(endpoint, throttle)
    }

    // Reset window if expired
    if (now - throttle.windowStart >= cfg.windowSize) {
      throttle.requestCount = 0
      throttle.burstCount = 0
      throttle.windowStart = now
    }

    // ❌ Reject if rate limit exceeded
    if (throttle.requestCount >= cfg.maxRequests) {
      console.warn(`[Throttle] Rate limit exceeded for ${endpoint}`)
      return false
    }

    // ❌ Reject if min interval not met (but allow burst)
    const timeSinceLastRequest = now - throttle.lastRequestTime
    if (timeSinceLastRequest < cfg.minInterval) {
      throttle.burstCount++
      if (throttle.burstCount > cfg.burstAllowed) {
        console.warn(`[Throttle] Min interval not met for ${endpoint}`)
        return false
      }
    }
    else {
      throttle.burstCount = 0
    }

    // ✅ Request allowed - update counters
    throttle.lastRequestTime = now
    throttle.requestCount++

    return true
  }

  /**
   * Get throttle status for endpoint
   */
  getStatus(endpoint: string) {
    const throttle = this.endpointThrottles.get(endpoint)
    if (!throttle) {
      return { throttled: false, requestCount: 0 }
    }

    const cfg = this.globalThrottles.get(endpoint) || DEFAULT_THROTTLE
    return {
      throttled: throttle.requestCount >= cfg.maxRequests,
      requestCount: throttle.requestCount,
      maxRequests: cfg.maxRequests,
      windowSize: cfg.windowSize,
      nextResetIn: cfg.windowSize - (Date.now() - throttle.windowStart),
    }
  }

  /**
   * Reset throttle for specific endpoint
   */
  reset(endpoint?: string) {
    if (endpoint) {
      this.endpointThrottles.delete(endpoint)
    }
    else {
      this.endpointThrottles.clear()
    }
  }

  /**
   * Get all throttle statistics
   */
  getAllStats() {
    const stats = {} as Record<string, any>
    for (const [endpoint, throttle] of this.endpointThrottles.entries()) {
      stats[endpoint] = {
        requestCount: throttle.requestCount,
        lastRequestTime: new Date(throttle.lastRequestTime).toISOString(),
        windowStart: new Date(throttle.windowStart).toISOString(),
      }
    }
    return stats
  }
}

export const throttler = new RequestThrottler()

// Pre-configure high-traffic endpoints
throttler.setConfig('/Athletes', {
  maxRequests: 50,
  minInterval: 200,
})

throttler.setConfig('/AthleteMeasurements', {
  maxRequests: 50,
  minInterval: 200,
})

throttler.setConfig('/Calendar', {
  maxRequests: 50,
  minInterval: 300,
})

throttler.setConfig('/RpeLinkQueue', {
  maxRequests: 100,
  minInterval: 100,
})

throttler.setConfig('/dashboard', {
  maxRequests: 30,
  minInterval: 500,
})
