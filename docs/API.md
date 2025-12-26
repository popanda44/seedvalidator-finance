# FinYeld AI - API Reference

## Overview

**Base URL:** `/api`
**Authentication:** NextAuth.js session (most endpoints)

---

## Dashboard

### GET /api/dashboard

Get dashboard summary with key metrics, transactions, and alerts.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `companyId` | string | Optional - Company ID for real data |

**Response:**

```json
{
  "metrics": {
    "cashBalance": 842500,
    "monthlyBurn": 85000,
    "burnChange": -5.2,
    "runway": 9.9,
    "mrr": 125000,
    "mrrChange": 12.5,
    "netBurn": -40000,
    "teamSize": 12
  },
  "recentTransactions": [...],
  "alerts": [...],
  "burnTrend": [...],
  "accounts": [...]
}
```

---

## Reports

### GET /api/reports

Generate report data for specified type and period.

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `type` | string | `executive`, `detailed`, `forecast` |
| `period` | string | `month`, `quarter`, `year` |

**Response:**

```json
{
  "success": true,
  "report": {
    "title": "Executive Summary",
    "keyMetrics": [...],
    "charts": [...],
    "transactions": [...],
    "summary": "..."
  }
}
```

### POST /api/reports/share

Create shareable report link.

**Body:**

```json
{
  "reportData": {...},
  "expiresIn": 604800
}
```

**Response:**

```json
{
  "success": true,
  "shareUrl": "https://...",
  "token": "abc123",
  "expiresAt": "2024-12-31T00:00:00Z"
}
```

### GET /api/reports/schedules

Get all scheduled reports.

### POST /api/reports/schedules

Create scheduled report delivery.

---

## Export

### GET /api/export

Export financial data in multiple formats.

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `format` | string | `csv`, `excel`, `json`, `markdown`, `pdf` |
| `type` | string | Report type |
| `period` | string | Report period |

---

## Expenses

### GET /api/expenses

Get expense breakdown by category.

**Response:**

```json
{
  "categories": [
    { "name": "Payroll", "amount": 45000, "percentage": 60 }
  ],
  "summary": {
    "totalExpenses": 85000,
    "transactionCount": 156
  },
  "pieChartData": [...],
  "topVendors": [...]
}
```

---

## Forecasts

### GET /api/forecasts

Get AI-powered financial forecasts.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `months` | number | Forecast horizon (6, 12, 24) |
| `confidence` | number | Confidence level (0.90, 0.95) |

**Response:**

```json
{
  "forecast": {
    "revenue": [...],
    "confidence": { "upper": [...], "lower": [...] }
  },
  "scenarios": {
    "base": {...},
    "optimistic": {...},
    "pessimistic": {...}
  }
}
```

---

## Alerts

### GET /api/alerts

Get financial alerts and notifications.

**Query Parameters:**
| Param | Type | Values |
|-------|------|--------|
| `filter` | string | `all`, `unread`, `critical`, `warning` |

### PATCH /api/alerts

Mark alerts as read/dismissed.

---

## Integrations

### GET /api/integrations/hubspot

Get HubSpot integration status and pipeline data.

### Plaid Endpoints

| Endpoint                       | Method | Description             |
| ------------------------------ | ------ | ----------------------- |
| `/api/plaid/create-link-token` | POST   | Create Plaid Link token |
| `/api/plaid/exchange-token`    | POST   | Exchange public token   |
| `/api/plaid/sync`              | POST   | Sync transactions       |
| `/api/plaid/webhook`           | POST   | Handle webhooks         |

---

## AI

### GET /api/ai/insights

Get AI-powered financial insights.

**Response:**

```json
{
  "insights": [
    {
      "type": "recommendation",
      "title": "Reduce Infrastructure Costs",
      "description": "...",
      "impact": "Save $2,000/month"
    }
  ]
}
```

---

## Authentication

| Endpoint                  | Method | Description          |
| ------------------------- | ------ | -------------------- |
| `/api/auth/[...nextauth]` | \*     | NextAuth.js handlers |
| `/api/auth/register`      | POST   | User registration    |
