import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Adjust sampling in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Debug mode
  debug: false,

  // Scrub sensitive data before sending
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request) {
      delete event.request.cookies
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['x-api-key']
        delete event.request.headers['cookie']
      }
    }

    // Mask PII in error messages
    if (event.message) {
      event.message = event.message
        .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
        .replace(/\bfyk_[a-zA-Z0-9_-]+\b/g, '[API_KEY]')
    }

    // Mask PII in exception values
    if (event.exception?.values) {
      event.exception.values.forEach((exception) => {
        if (exception.value) {
          exception.value = exception.value
            .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
            .replace(/\bfyk_[a-zA-Z0-9_-]+\b/g, '[API_KEY]')
        }
      })
    }

    return event
  },

  // Ignore common non-actionable errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /Loading chunk \d+ failed/,
  ],
})

// Set user context for better error tracking
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email ? email.replace(/^(.{2}).*(@.*)$/, '$1***$2') : undefined,
  })
}

// Clear user context on logout
export function clearSentryUser() {
  Sentry.setUser(null)
}

// Capture security-related events
export function captureSecurityEvent(
  message: string,
  level: 'warning' | 'error' | 'fatal' = 'warning',
  extra?: Record<string, unknown>
) {
  Sentry.captureMessage(message, {
    level,
    tags: { category: 'security' },
    extra,
  })
}

