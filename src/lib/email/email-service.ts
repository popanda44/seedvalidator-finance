import { Resend } from 'resend';

// Initialize Resend client only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email sender configuration - Use Resend's default domain for testing
// For production, add a verified domain and set EMAIL_FROM environment variable
const FROM_EMAIL = process.env.EMAIL_FROM || 'SeedValidator <onboarding@resend.dev>';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.warn('Email service not configured - RESEND_API_KEY is missing');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      throw new Error(error.message);
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
}

// Alert-specific email functions
export async function sendRunwayAlert(email: string, companyName: string, runway: number) {
  const subject = `⚠️ Critical: Runway Below ${runway} Months`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .metric { font-size: 48px; font-weight: bold; color: #ef4444; }
        .cta { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🚨 Runway Alert</h1>
          <p style="margin: 10px 0 0;">Immediate attention required</p>
        </div>
        <div class="content">
          <p>Hi ${companyName} Team,</p>
          <p>Your current runway has dropped to a critical level:</p>
          <p class="metric">${runway.toFixed(1)} months</p>
          <p>This is below the recommended 6-month threshold. We recommend:</p>
          <ul>
            <li>Review and reduce non-essential expenses</li>
            <li>Accelerate revenue initiatives</li>
            <li>Consider fundraising options</li>
          </ul>
          <a href="https://potent-fin.vercel.app/dashboard" class="cta">View Dashboard →</a>
        </div>
        <div class="footer">
          <p>SeedValidator Finance | AI-Powered FP&A for Startups</p>
          <p>You received this because you have runway alerts enabled.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendSpendingAlert(
  email: string,
  companyName: string,
  category: string,
  amount: number,
  percentageIncrease: number
) {
  const subject = `📈 Spending Spike: ${category} up ${percentageIncrease.toFixed(0)}%`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .metric { font-size: 36px; font-weight: bold; color: #f59e0b; }
        .cta { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📈 Spending Alert</h1>
          <p style="margin: 10px 0 0;">Unusual spending detected</p>
        </div>
        <div class="content">
          <p>Hi ${companyName} Team,</p>
          <p>We detected an unusual increase in <strong>${category}</strong> spending:</p>
          <p class="metric">+${percentageIncrease.toFixed(0)}%</p>
          <p>Current amount: <strong>$${amount.toLocaleString()}</strong></p>
          <p>This is significantly higher than your typical spending pattern.</p>
          <a href="https://potent-fin.vercel.app/dashboard/expenses" class="cta">Review Expenses →</a>
        </div>
        <div class="footer">
          <p>SeedValidator Finance | AI-Powered FP&A for Startups</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendWeeklyDigest(
  email: string,
  companyName: string,
  metrics: {
    cashBalance: number;
    burnRate: number;
    runway: number;
    mrr: number;
    mrrChange: number;
    topExpenses: { category: string; amount: number }[];
  }
) {
  const subject = `📊 Weekly Financial Digest - ${companyName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
        .metric-card { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 8px 0; }
        .metric-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #0f172a; }
        .cta { display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📊 Weekly Digest</h1>
          <p style="margin: 10px 0 0;">${companyName} | ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div class="content">
          <p>Here's your financial summary for this week:</p>
          
          <div class="metric-card">
            <div class="metric-label">Cash Balance</div>
            <div class="metric-value">$${(metrics.cashBalance / 1000).toFixed(0)}K</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Monthly Burn</div>
            <div class="metric-value">$${(metrics.burnRate / 1000).toFixed(0)}K</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Runway</div>
            <div class="metric-value">${metrics.runway.toFixed(1)} months</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">MRR</div>
            <div class="metric-value">$${(metrics.mrr / 1000).toFixed(0)}K</div>
          </div>

          <a href="https://potent-fin.vercel.app/dashboard" class="cta">View Full Dashboard →</a>
        </div>
        <div class="footer">
          <p>SeedValidator Finance | AI-Powered FP&A for Startups</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
