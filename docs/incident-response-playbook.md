# SECURITY INCIDENT RESPONSE PLAYBOOK

> **FinYeld AI Security Team**
> Last Updated: December 2024

---

## SEVERITY LEVELS

| Level | Response Time | Examples |
|-------|---------------|----------|
| **CRITICAL** | 15 minutes | Data breach, system compromise, exfiltration |
| **HIGH** | 1 hour | Brute force, unauthorized access, API abuse |
| **MEDIUM** | 4 hours | Unusual activity, failed auth spikes |
| **LOW** | 24 hours | Policy violations, minor anomalies |

---

## IMMEDIATE RESPONSE (Within 15 minutes)

### Step 1: Confirm the Incident
- [ ] Verify alert is not a false positive
- [ ] Check Sentry for related errors
- [ ] Review audit logs in `/api/admin/audit-logs`
- [ ] Identify affected systems/users

### Step 2: Contain the Threat
- [ ] Suspend compromised accounts (auto-triggered at 5 failed auth)
- [ ] Revoke suspicious API keys
- [ ] Block malicious IP addresses (update rate limiter)
- [ ] Rotate affected credentials

### Step 3: Alert the Team
```bash
# Create incident channel
Slack: #incident-YYYY-MM-DD-[brief-description]

# Notify via PagerDuty (auto-triggered for CRITICAL)
Manual: Open PagerDuty → Create Incident

# Assign roles:
- Incident Commander: [On-call lead]
- Technical Lead: [Senior Engineer]
- Communications: [CEO/CTO]
```

---

## INVESTIGATION PHASE (Within 1 hour)

### Step 4: Gather Evidence
```sql
-- Export last 24 hours of audit logs
SELECT * FROM "AuditLog"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;

-- Check suspicious user activity
SELECT * FROM "AuditLog"
WHERE "userId" = '[SUSPECT_ID]'
ORDER BY "createdAt" DESC
LIMIT 100;
```

- [ ] Export relevant logs to secure location
- [ ] Take database snapshots
- [ ] Screenshot Sentry error details
- [ ] Document timeline in incident channel

### Step 5: Assess Impact
- [ ] What data was accessed/modified?
- [ ] Which users/companies affected?
- [ ] Was data exported externally?
- [ ] Estimate financial/reputation impact

### Step 6: Root Cause Analysis
- [ ] Identify vulnerability exploited
- [ ] Determine attack vector (API, auth, etc.)
- [ ] Review security monitor alerts
- [ ] Check if threat is ongoing

---

## REMEDIATION PHASE (Within 24 hours)

### Step 7: Fix the Vulnerability
- [ ] Develop and test hotfix
- [ ] Deploy to staging, then production
- [ ] Verify fix prevents recurrence
- [ ] Update security policies

### Step 8: Notify Affected Parties
**If PII compromised:**
- [ ] Draft user notification email
- [ ] Update status page (if public impact)
- [ ] Notify legal/compliance team
- [ ] Prepare customer FAQ

### Step 9: Restore Normal Operations
- [ ] Review & unsuspend legitimate accounts
- [ ] Restore affected services
- [ ] Monitor for 24h post-remediation
- [ ] Confirm system stability

---

## POST-INCIDENT REVIEW (Within 1 week)

### Step 10: Post-Mortem
- [ ] Schedule blameless post-mortem meeting
- [ ] Document complete incident timeline
- [ ] Identify what worked / what didn't
- [ ] Create action items with owners + deadlines

### Step 11: Improve Security Posture
- [ ] Implement additional monitoring if needed
- [ ] Update this playbook with lessons learned
- [ ] Schedule security training if human error involved
- [ ] Plan follow-up security audit

---

## NOTIFICATION TEMPLATES

### User Notification (Data Breach)

```
Subject: Important Security Notice - Action Required

Dear [User Name],

We are writing to inform you of a security incident that may have 
affected your account.

**What Happened:**
On [DATE], we detected unauthorized access to [DESCRIPTION].

**What Information Was Involved:**
[List specific data types - email, financial data, etc.]

**What We're Doing:**
✓ Immediately patched the security vulnerability
✓ Launched full investigation with security experts
✓ Enhanced monitoring and security measures
✓ Notified relevant authorities as required

**What You Should Do:**
1. Reset your password immediately
2. Enable two-factor authentication
3. Review your account for unauthorized activity
4. Monitor your financial statements

We take security seriously and sincerely apologize for this incident. 
If you have questions, please contact security@finyeld.ai.

Sincerely,
[CEO Name]
CEO, FinYeld AI
```

---

## QUICK REFERENCE

### Security Monitor Alerts
| Alert Type | Auto-Action | Escalation |
|------------|-------------|------------|
| `BRUTE_FORCE_ATTEMPT` | Block after 10 fails | Slack + PagerDuty |
| `UNUSUAL_API_ACTIVITY` | Log + Alert | Slack |
| `POTENTIAL_DATA_EXFILTRATION` | Alert + Review | Slack + PagerDuty |
| `UNAUTHORIZED_ACCESS_ATTEMPT` | Suspend at 5 attempts | Slack + PagerDuty |

### Contact List
| Role | Name | Contact |
|------|------|---------|
| Security Lead | TBD | security@finyeld.ai |
| CTO | TBD | cto@finyeld.ai |
| CEO | TBD | ceo@finyeld.ai |
| Legal | TBD | legal@finyeld.ai |

### External Resources
- **Vercel Status**: status.vercel.com
- **Neon Status**: neonstatus.com
- **Plaid Status**: status.plaid.com

---

## ENVIRONMENT VARIABLES

Ensure these are configured for full alerting:

```env
# Slack webhook for #security-alerts channel
SLACK_SECURITY_WEBHOOK=https://hooks.slack.com/services/xxx

# PagerDuty integration key
PAGERDUTY_ROUTING_KEY=xxx

# Sentry DSN for error tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```
