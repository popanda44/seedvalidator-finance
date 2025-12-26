/**
 * FinYeld AI - Integration Index
 * Re-exports all integration components
 */

// Core types and utilities
export * from './types'

// Integration adapters
export { PlaidIntegration } from './adapters/plaid-adapter'
export { StripeIntegration } from './adapters/stripe-adapter'
export { SalesforceIntegration } from './adapters/salesforce-adapter'

// Re-export factory for convenience
import { IntegrationFactory, IntegrationType, INTEGRATION_CONFIG } from './types'

export { IntegrationFactory, INTEGRATION_CONFIG }
export type { IntegrationType }
