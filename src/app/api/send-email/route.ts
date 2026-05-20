import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

/**
 * EMAIL ROUTE — Uses Supabase SMTP / Gmail SMTP
 * No Resend. No paid services.
 * Configure SMTP credentials in your .env.local and Vercel environment variables.
 *
 * For Gmail:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your@gmail.com
 *   SMTP_PASS=your-gmail-app-password   ← NOT your normal password, use App Password
 *   EMAIL_FROM=Farmers Factory <your@gmail.com>
 */

const FROM_EMAIL = process.env.EMAIL_FROM || 'Farmers Factory <no-reply@farmersfactory.com>';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for 587
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false // Allow self-signed certs (needed for some SMTP providers)
    }
  });
}

function buildHtml(template: string, data: any): string {
  const baseStyle = `
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 0;
    background: #ffffff;
  `;
  const headerStyle = `
    background: #E75129;
    padding: 30px 40px;
    border-radius: 12px 12px 0 0;
  `;
  const bodyStyle = `
    padding: 40px;
    border: 1px solid #eee;
    border-top: none;
    border-radius: 0 0 12px 12px;
  `;
  const footerStyle = `
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 12px;
  `;
  const btnStyle = `
    display: inline-block;
    background: #E75129;
    color: white !important;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px;
    margin: 20px 0;
  `;

  let body = '';

  switch (template) {
    case 'security_code':
      body = `
        <h2 style="color:#E75129;margin-top:0;">Your Verification Code</h2>
        <p style="color:#555;">Enter this code to verify your Farmers Factory account:</p>
        <div style="background:#f5f5f5;padding:24px;text-align:center;font-size:40px;font-weight:bold;
                    letter-spacing:10px;color:#222;border-radius:8px;margin:20px 0;">
          ${data.code}
        </div>
        <p style="color:#999;font-size:13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      `;
      break;

    case 'contact_inquiry':
      body = `
        <h2 style="color:#E75129;margin-top:0;">📬 New Contact Form Enquiry</h2>
        <p style="color:#555;">Someone submitted the contact form on the Farmers Factory website. Details below:</p>
        <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:8px 0;"><strong>Full Name:</strong> ${data.name}</p>
          <p style="margin:8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color:#E75129;">${data.email}</a></p>
          <p style="margin:8px 0;"><strong>Subject:</strong> ${data.subject}</p>
        </div>
        <div style="background:#fff8f6;border-left:4px solid #E75129;padding:20px;border-radius:0 8px 8px 0;margin:20px 0;">
          <p style="color:#333;font-weight:bold;margin:0 0 8px;">Message:</p>
          <p style="color:#555;margin:0;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
        </div>
        <p style="color:#999;font-size:13px;">Reply directly to <a href="mailto:${data.email}" style="color:#E75129;">${data.email}</a> to respond to this enquiry.</p>
      `;
      break;

    case 'welcome':
      body = `
        <h2 style="color:#E75129;margin-top:0;">Welcome to the Farm, ${data.name}! 🌿</h2>
        <p style="color:#555;">We're thrilled to have you in our organic family. Get ready for the freshest harvest delivered straight to your doorstep.</p>
        <ul style="color:#555;line-height:2;">
          <li>🥦 100% Organic, Chemical-Free</li>
          <li>🚚 Delivered within 24 hours of harvest</li>
          <li>💰 Use code <strong>WELCOME10</strong> for 10% off your first order</li>
        </ul>
        <div style="text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com'}" style="${btnStyle}">
            Start Shopping
          </a>
        </div>
      `;
      break;

    case 'order_confirmation':
      body = `
        <h2 style="color:#E75129;margin-top:0;">Order Confirmed! ✅</h2>
        <p style="color:#555;">Thank you for your order. Our farmers are preparing your fresh harvest right now.</p>
        <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:8px 0;"><strong>Order Number:</strong> #${data.orderNumber || data.orderId?.slice(0, 8) || 'N/A'}</p>
          <p style="margin:8px 0;"><strong>Total:</strong> ₹${data.total}</p>
          <p style="margin:8px 0;"><strong>Date:</strong> ${data.date || new Date().toLocaleDateString()}</p>
          <p style="margin:8px 0;"><strong>Delivery:</strong> Within 24 hours</p>
        </div>
        <div style="text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || '#'}/orders" style="${btnStyle}">
            Track Your Order
          </a>
        </div>
      `;
      break;

    default: {
      // Generic for order status updates: packed, shipped, delivered, cancelled, rejected
      const statusTitle = template.replace('order_', '').replace('_', ' ').toUpperCase();
      const statusEmoji: Record<string, string> = {
        PACKED: '📦', SHIPPED: '🚚', DELIVERED: '✅', CANCELLED: '❌', REJECTED: '🚫', CONFIRMED: '✔️'
      };
      const emoji = statusEmoji[statusTitle] || '📋';
      body = `
        <h2 style="color:#E75129;margin-top:0;">Order Update ${emoji}</h2>
        <p style="color:#555;">Your order status has been updated.</p>
        <div style="background:#f9f9f9;padding:20px;border-radius:8px;margin:20px 0;">
          <p style="margin:8px 0;"><strong>Order Number:</strong> #${data.orderNumber || data.orderId?.slice(0, 8) || 'N/A'}</p>
          <p style="margin:8px 0;"><strong>New Status:</strong>
            <span style="color:#E75129;font-weight:bold;">${statusTitle}</span>
          </p>
          ${data.message ? `<p style="margin:8px 0;color:#555;">${data.message}</p>` : ''}
        </div>
        <div style="text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || '#'}/orders" style="${btnStyle}">
            View My Orders
          </a>
        </div>
      `;
    }
  }

  return `
    <div style="${baseStyle}">
      <div style="${headerStyle}">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:bold;letter-spacing:1px;">
          🌿 FARMERS FACTORY
        </h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">
          Farm to Table in 24 Hours
        </p>
      </div>
      <div style="${bodyStyle}">
        ${body}
      </div>
      <div style="${footerStyle}">
        <p>© ${new Date().getFullYear()} Farmers Factory. All rights reserved.</p>
        <p style="margin:0;">You received this email because you have an account with us.</p>
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  const transporter = createTransporter();

  if (!transporter) {
    // Gracefully skip — don't crash the app if SMTP not configured
    console.warn('[Email] SMTP not configured. Skipping email. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.');
    return NextResponse.json({ skipped: true, message: 'Email service not configured' }, { status: 200 });
  }

  try {
    const { to, subject, template, data } = await req.json();

    if (!to || !subject || !template) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, template' }, { status: 400 });
    }

    const html = buildHtml(template, data || {});

    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`[Email] ✅ Sent "${template}" email to ${to}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Email] ❌ Failed to send email:', error.message);
    // Return 200 so the order flow doesn't break — email failure is non-critical
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
