import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * EMAIL ROUTE — Premium branded transactional emails
 * Uses nodemailer SMTP (Gmail / any provider). No paid email service.
 *
 * Configure SMTP credentials in .env.local and Vercel environment variables:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your@gmail.com
 *   SMTP_PASS=your-gmail-app-password
 *   EMAIL_FROM=Farmers Factory <your@gmail.com>
 */

const FROM_EMAIL = process.env.EMAIL_FROM || 'Farmers Factory <no-reply@farmersfactory.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://farmersfactory.com';

// ─── Supabase (server-side, service role) ─────────────────────────────────────
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ─── SMTP Transporter ─────────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

// ─── Shared Design Tokens ─────────────────────────────────────────────────────
const BRAND_PRIMARY   = '#E75129';   // Farmers Factory orange-red
const BRAND_SECONDARY = '#FF8C00';   // Warm orange
const BRAND_DARK      = '#1A1A1A';
const BRAND_LIGHT     = '#FFF8F5';
const BRAND_MUTED     = '#888888';
const BRAND_GREEN     = '#2E7D32';

// ─── Shared Outer Wrapper ─────────────────────────────────────────────────────
function wrapEmail(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Farmers Factory</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F4;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          ${innerHtml}
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Logo Bar ─────────────────────────────────────────────────────────────────
function logoBar(): string {
  return `
  <tr>
    <td style="background:#FFFFFF;padding:20px 40px;border-bottom:1px solid #F0F0F0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-size:20px;font-weight:900;letter-spacing:1px;color:${BRAND_PRIMARY};">🌿 FARMERS FACTORY</span>
            <br/>
            <span style="font-size:11px;color:${BRAND_MUTED};letter-spacing:2px;text-transform:uppercase;">Farm to Table in 24 Hours</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function heroBanner(headline: string, subline: string, gradient = `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%)`): string {
  return `
  <tr>
    <td style="background:${gradient};padding:48px 40px 40px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.75);">FARMERS FACTORY</p>
      <h1 style="margin:0;font-size:34px;font-weight:900;line-height:1.15;color:#FFFFFF;letter-spacing:-0.5px;">${headline}</h1>
      ${subline ? `<p style="margin:12px 0 0;font-size:15px;color:rgba(255,255,255,0.85);font-weight:500;">${subline}</p>` : ''}
    </td>
  </tr>`;
}

// ─── Order Status Tracker ─────────────────────────────────────────────────────
// steps: 0=Confirmed, 1=Shipped, 2=Out for Delivery, 3=Delivered
function statusTracker(activeStep: number): string {
  const steps = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const dots = steps.map((label, i) => {
    const done = i <= activeStep;
    const circle = done
      ? `<td align="center" width="25%"><div style="width:16px;height:16px;border-radius:50%;background:${BRAND_PRIMARY};display:inline-block;border:3px solid ${BRAND_PRIMARY};"></div></td>`
      : `<td align="center" width="25%"><div style="width:16px;height:16px;border-radius:50%;background:#E0E0E0;display:inline-block;border:3px solid #E0E0E0;"></div></td>`;
    const text = done
      ? `<td align="center" width="25%"><span style="font-size:10px;font-weight:700;color:${BRAND_PRIMARY};letter-spacing:0.3px;">${label}</span></td>`
      : `<td align="center" width="25%"><span style="font-size:10px;color:#BBBBBB;font-weight:500;">${label}</span></td>`;
    return { circle, text };
  });

  const lineColor = (i: number) => i < activeStep ? BRAND_PRIMARY : '#E0E0E0';

  return `
  <tr>
    <td style="padding:28px 40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          ${dots.map((d, i) => {
            if (i < dots.length - 1) {
              return `${d.circle}<td width="auto" style="padding-bottom:8px;"><div style="height:3px;background:${lineColor(i)};border-radius:2px;margin:0 4px;"></div></td>`;
            }
            return d.circle;
          }).join('')}
        </tr>
        <tr>
          ${dots.map(d => d.text).join('')}
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function sectionHeading(text: string): string {
  return `
  <tr>
    <td style="padding:24px 40px 12px;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${BRAND_DARK};">${text}</p>
    </td>
  </tr>`;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function divider(): string {
  return `<tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #F0F0F0;margin:4px 0;" /></td></tr>`;
}

// ─── Order Item Row ───────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function orderItemRow(item: any): string {
  const total = (Number(item.price_at_purchase || item.price || 0) * Number(item.quantity)).toFixed(2);
  const imgSrc = item.products?.image_url || item.image_url || '';
  const name = item.products?.name || item.name || 'Product';
  return `
  <tr>
    <td style="padding:12px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="64" style="vertical-align:top;padding-right:16px;">
            ${imgSrc
              ? `<img src="${imgSrc}" width="64" height="64" alt="${name}" style="border-radius:10px;object-fit:cover;display:block;border:1px solid #F0F0F0;" />`
              : `<div style="width:64px;height:64px;border-radius:10px;background:${BRAND_LIGHT};display:flex;align-items:center;justify-content:center;font-size:28px;">🥦</div>`
            }
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND_DARK};line-height:1.3;">${name}</p>
            <p style="margin:0;font-size:13px;font-weight:600;color:${BRAND_MUTED};">
              Quantity: ${item.quantity} &nbsp;·&nbsp; Total: <strong style="color:${BRAND_DARK};">₹${total}</strong>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Price Breakdown ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function priceBreakdown(data: any): string {
  const total = Number(data.total || data.total_amount || 0);
  const subtotal = Number(data.subtotal || 0);
  const deliveryFee = Number(data.deliveryFee || data.delivery_fee || 0);
  const discount = Number(data.discount || 0);

  // Estimate IGST = 18% of subtotal if we have subtotal, else derive from total
  const base = subtotal > 0 ? subtotal : (total / 1.18);
  const igst = subtotal > 0 ? total - subtotal - deliveryFee + discount : total - base;

  return `
  <tr>
    <td style="padding:8px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F0F0F0;padding-top:16px;margin-top:8px;">
        ${subtotal > 0 ? `
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#555;">Subtotal (Including Taxes)</td>
          <td style="padding:5px 0;font-size:13px;color:#555;text-align:right;">₹${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#555;">IGST (18.0%)</td>
          <td style="padding:5px 0;font-size:13px;color:#555;text-align:right;">₹${igst.toFixed(2)}</td>
        </tr>` : ''}
        ${deliveryFee > 0 ? `
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#555;">Delivery Fee</td>
          <td style="padding:5px 0;font-size:13px;color:#555;text-align:right;">₹${deliveryFee.toFixed(2)}</td>
        </tr>` : ''}
        ${discount > 0 ? `
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#2E7D32;">Coupon Discount</td>
          <td style="padding:5px 0;font-size:13px;color:#2E7D32;text-align:right;">- ₹${discount.toFixed(2)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:14px 0 4px;font-size:15px;font-weight:900;color:${BRAND_DARK};border-top:1px solid #F0F0F0;">Grand Total</td>
          <td style="padding:14px 0 4px;font-size:18px;font-weight:900;color:${BRAND_PRIMARY};text-align:right;border-top:1px solid #F0F0F0;">₹${total.toFixed(2)}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function ctaButton(label: string, url: string): string {
  return `
  <tr>
    <td style="padding:8px 40px 32px;">
      <a href="${url}" style="display:block;background:${BRAND_PRIMARY};color:#FFFFFF !important;text-align:center;padding:16px 32px;border-radius:10px;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">${label} &rsaquo;</a>
    </td>
  </tr>`;
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function emailFooter(): string {
  return `
  <tr>
    <td style="background:#1A1A1A;padding:28px 40px;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 6px;font-size:16px;font-weight:900;color:#FFFFFF;letter-spacing:1px;">🌿 FARMERS FACTORY</p>
      <p style="margin:0 0 16px;font-size:11px;color:#888888;letter-spacing:1px;">FARM TO TABLE IN 24 HOURS</p>
      <p style="margin:0;font-size:11px;color:#666666;line-height:1.7;">
        © ${new Date().getFullYear()} Farmers Factory. All rights reserved.<br/>
        You received this email because you have an account with us.<br/>
        <a href="${SITE_URL}" style="color:#E75129;text-decoration:none;">Visit our website</a>
      </p>
    </td>
  </tr>`;
}

// ─── Greeting Row ─────────────────────────────────────────────────────────────
function greeting(name: string, message: string): string {
  const firstName = (name || 'Valued Customer').split(' ')[0];
  return `
  <tr>
    <td style="padding:28px 40px 8px;">
      <p style="margin:0 0 10px;font-size:17px;font-weight:700;color:${BRAND_DARK};">Hi ${firstName},</p>
      <p style="margin:0;font-size:15px;color:#555555;line-height:1.7;">${message}</p>
    </td>
  </tr>`;
}

// ─── Security Alert Section (for OTP) ─────────────────────────────────────────
function securityAlert(): string {
  return `
  <tr>
    <td style="padding:0 40px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#4A1010;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:900;color:#FFFFFF;">⚠️ Security Notice</p>
            <p style="margin:0 0 10px;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;">Scammers may try to reach you pretending to be from the Farmers Factory team. Please know this is not us.</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.7;">
              • We will <strong>never</strong> call you for OTP codes<br/>
              • We will <strong>never</strong> ask for payments through links
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Master HTML Builder ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildHtml(template: string, data: any, items: any[] = []): string {
  const customerName = data.customerName || data.name || 'Valued Customer';
  const orderNumber  = data.orderNumber || (data.orderId ? String(data.orderId).slice(0, 8) : 'N/A');
  const ordersUrl    = `${SITE_URL}/orders`;

  let rows = '';

  switch (template) {
    // ── OTP / Security Code ──────────────────────────────────────────────────
    case 'security_code': {
      rows = `
        ${logoBar()}
        ${heroBanner('Verify Your Identity 🔐', 'Enter the code below to access your account', `linear-gradient(135deg, #1A237E 0%, #3949AB 100%)`)}
        ${greeting(customerName, 'We received a request to verify your Farmers Factory account. Use the one-time code below:')}
        <tr>
          <td style="padding:8px 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_LIGHT};border-radius:12px;border:2px dashed ${BRAND_PRIMARY};">
              <tr>
                <td style="padding:28px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${BRAND_MUTED};">Your Verification Code</p>
                  <p style="margin:0;font-size:52px;font-weight:900;letter-spacing:14px;color:${BRAND_DARK};font-family:monospace;">${data.code}</p>
                  <p style="margin:12px 0 0;font-size:12px;color:${BRAND_MUTED};">⏱ Expires in <strong>10 minutes</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="margin:0;font-size:13px;color:${BRAND_MUTED};line-height:1.7;">If you didn't request this code, you can safely ignore this email. Someone may have typed your email address by mistake.</p>
          </td>
        </tr>
        ${securityAlert()}
      `;
      break;
    }

    // ── Order Confirmed ──────────────────────────────────────────────────────
    case 'order_confirmation':
    case 'order_confirmed': {
      rows = `
        ${logoBar()}
        ${heroBanner('Happiness Coming Your Way ✦', 'Your order is confirmed and our farmers are on it!')}
        ${greeting(customerName, `Your order <strong>#${orderNumber}</strong> has been confirmed. Our farmers are carefully picking the freshest produce just for you.`)}
        <tr><td style="padding:4px 40px 0;"><p style="margin:0;font-size:13px;background:#E8F5E9;color:${BRAND_GREEN};padding:10px 16px;border-radius:8px;font-weight:600;">📦 Your order will be delivered within 24 hours of harvest.</p></td></tr>
        ${statusTracker(0)}
        ${items.length > 0 ? `${sectionHeading('YOUR ORDER')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
      `;
      break;
    }

    // ── Order Processing / Packed ─────────────────────────────────────────────
    case 'order_processing':
    case 'order_packed': {
      rows = `
        ${logoBar()}
        ${heroBanner('Getting It Ready For You 📦', 'Your order is being packed with care')}
        ${greeting(customerName, `Great news! Your order <strong>#${orderNumber}</strong> is now being carefully packed by our team and will be dispatched soon.`)}
        ${statusTracker(0)}
        ${items.length > 0 ? `${sectionHeading('YOUR ORDER')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
      `;
      break;
    }

    // ── Order Shipped ─────────────────────────────────────────────────────────
    case 'order_shipped': {
      rows = `
        ${logoBar()}
        ${heroBanner('Happiness Coming Your Way 🚀', 'Your package is on its way to you!')}
        ${greeting(customerName, `Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to your doorstep. Our delivery team will reach you very soon.`)}
        ${statusTracker(1)}
        ${items.length > 0 ? `${sectionHeading('YOUR ORDER')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
      `;
      break;
    }

    // ── Out for Delivery ──────────────────────────────────────────────────────
    case 'order_out_for_delivery': {
      rows = `
        ${logoBar()}
        ${heroBanner('Almost There! 🛵', 'Your package is out for delivery today')}
        ${greeting(customerName, `Your package with order <strong>#${orderNumber}</strong> is out for delivery and will reach your doorstep within a few hours.`)}
        ${statusTracker(2)}
        ${items.length > 0 ? `${sectionHeading('YOUR ORDER')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
      `;
      break;
    }

    // ── Order Delivered ───────────────────────────────────────────────────────
    case 'order_delivered': {
      rows = `
        ${logoBar()}
        ${heroBanner('Delivered with Love 🌿', 'Your fresh farm produce has arrived!', `linear-gradient(135deg, ${BRAND_GREEN} 0%, #43A047 100%)`)}
        ${greeting(customerName, `Your order <strong>#${orderNumber}</strong> has been successfully delivered. We hope you enjoy the freshest harvest from our farms!`)}
        ${statusTracker(3)}
        ${items.length > 0 ? `${sectionHeading('YOUR ORDER')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        <tr>
          <td style="padding:0 40px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_LIGHT};border-radius:10px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${BRAND_DARK};">🌟 Loved your order?</p>
                <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Share your experience! Your feedback helps our farmers grow better.</p>
              </td></tr>
            </table>
          </td>
        </tr>
        ${ctaButton('VIEW MY ORDERS', ordersUrl)}
      `;
      break;
    }

    // ── Order Cancelled ───────────────────────────────────────────────────────
    case 'order_cancelled': {
      rows = `
        ${logoBar()}
        ${heroBanner('Order Cancelled ❌', 'We\'re sorry to see this order go', `linear-gradient(135deg, #616161 0%, #9E9E9E 100%)`)}
        ${greeting(customerName, `Your order <strong>#${orderNumber}</strong> has been cancelled as requested. If a payment was made, a refund will be processed to your original payment method within 5–7 business days.`)}
        ${items.length > 0 ? `${sectionHeading('CANCELLED ITEMS')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF3E0;border-radius:10px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#E65100;">Need help?</p>
                <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">Contact our support team at <a href="mailto:support@farmersfactory.com" style="color:${BRAND_PRIMARY};text-decoration:none;font-weight:600;">support@farmersfactory.com</a></p>
              </td></tr>
            </table>
          </td>
        </tr>
        ${ctaButton('SHOP AGAIN', SITE_URL)}
      `;
      break;
    }

    // ── Order Rejected ────────────────────────────────────────────────────────
    case 'order_rejected': {
      rows = `
        ${logoBar()}
        ${heroBanner('Order Could Not Be Fulfilled 🚫', 'We apologise for the inconvenience', `linear-gradient(135deg, #B71C1C 0%, #E53935 100%)`)}
        ${greeting(customerName, `Unfortunately, your order <strong>#${orderNumber}</strong> could not be fulfilled. Any payment made will be refunded within 5–7 business days.`)}
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF3E0;border-radius:10px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#E65100;">Why was my order rejected?</p>
                <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">This can happen due to stock unavailability or delivery constraints. Please contact us for details at <a href="mailto:support@farmersfactory.com" style="color:${BRAND_PRIMARY};text-decoration:none;font-weight:600;">support@farmersfactory.com</a></p>
              </td></tr>
            </table>
          </td>
        </tr>
        ${ctaButton('EXPLORE OTHER PRODUCTS', SITE_URL)}
      `;
      break;
    }

    // ── Welcome Email ─────────────────────────────────────────────────────────
    case 'welcome': {
      rows = `
        ${logoBar()}
        ${heroBanner(`Welcome to the Farm, ${(customerName).split(' ')[0]}! 🌿`, 'Your journey to fresh, organic produce starts here')}
        ${greeting(customerName, 'We\'re thrilled to have you in our organic family. Get ready for the freshest harvest delivered straight to your doorstep.')}
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_LIGHT};border-radius:12px;">
              <tr><td style="padding:24px;">
                <p style="margin:0 0 16px;font-size:13px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:${BRAND_DARK};">YOUR BENEFITS INCLUDE:</p>
                <table cellpadding="0" cellspacing="0">
                  ${[
                    ['🥦', '100% Organic, Chemical-Free', 'Direct from our verified farms'],
                    ['🚚', 'Delivered in 24 Hours', 'Farm to table, same day freshness'],
                    ['💰', 'WELCOME10 — 10% Off', 'Use this code on your first order'],
                  ].map(([icon, title, sub]) => `
                  <tr>
                    <td width="36" style="vertical-align:top;padding:6px 12px 6px 0;font-size:22px;">${icon}</td>
                    <td style="padding:6px 0;">
                      <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND_DARK};">${title}</p>
                      <p style="margin:2px 0 0;font-size:12px;color:${BRAND_MUTED};">${sub}</p>
                    </td>
                  </tr>`).join('')}
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
        ${ctaButton('START SHOPPING', SITE_URL)}
      `;
      break;
    }

    // ── Contact Enquiry (internal) ─────────────────────────────────────────────
    case 'contact_inquiry': {
      rows = `
        ${logoBar()}
        ${heroBanner('📬 New Contact Enquiry', 'Someone submitted the contact form')}
        <tr>
          <td style="padding:28px 40px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_LIGHT};border-radius:10px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:4px 0;font-size:14px;color:${BRAND_DARK};"><strong>Name:</strong> ${data.name}</p>
                <p style="margin:4px 0;font-size:14px;color:${BRAND_DARK};"><strong>Email:</strong> <a href="mailto:${data.email}" style="color:${BRAND_PRIMARY};">${data.email}</a></p>
                <p style="margin:4px 0;font-size:14px;color:${BRAND_DARK};"><strong>Subject:</strong> ${data.subject}</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 40px 28px;">
            <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_MUTED};">Message</p>
            <div style="background:#FAFAFA;border-left:4px solid ${BRAND_PRIMARY};padding:16px 20px;border-radius:0 8px 8px 0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${data.message}</div>
          </td>
        </tr>
      `;
      break;
    }

    // ── Generic fallback ─────────────────────────────────────────────────────
    default: {
      const statusTitle = template.replace('order_', '').replace(/_/g, ' ').toUpperCase();
      rows = `
        ${logoBar()}
        ${heroBanner(`Order ${statusTitle}`, data.message || 'Your order status has been updated')}
        ${greeting(customerName, data.message || `Your order <strong>#${orderNumber}</strong> status has been updated to <strong>${statusTitle}</strong>.`)}
        ${statusTracker(0)}
        ${items.length > 0 ? `${sectionHeading('YOUR ORDER')}${divider()}${items.map(orderItemRow).join(divider())}${divider()}${priceBreakdown(data)}` : ''}
        ${ctaButton('VIEW MY ORDERS', ordersUrl)}
      `;
    }
  }

  return wrapEmail(`<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`);
}

// ─── API Route Handler ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Email] SMTP not configured. Skipping email. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.');
    return NextResponse.json({ skipped: true, message: 'Email service not configured' }, { status: 200 });
  }

  try {
    const { to, subject, template, data } = await req.json();

    if (!to || !subject || !template) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, template' }, { status: 400 });
    }

    // ── Fetch order items server-side for order-related emails ───────────────
    let items: unknown[] = [];
    const isOrderEmail = template.startsWith('order_') || template === 'order_confirmation';
    const orderId = data?.orderId;

    if (isOrderEmail && orderId) {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, products(name, image_url, unit)')
            .eq('order_id', orderId);

          if (orderItems && orderItems.length > 0) {
            items = orderItems;
          }

          // Also fetch customer name if not passed
          if (!data.customerName && data.userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', data.userId)
              .single();
            if (profile?.full_name) data.customerName = profile.full_name;
          }
        }
      } catch (fetchErr) {
        console.warn('[Email] Could not fetch order items, sending without items:', fetchErr);
      }
    }

    const html = buildHtml(template, data || {}, items as never[]);

    await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });

    console.log(`[Email] ✅ Sent "${template}" to ${to}`);
    return NextResponse.json({ success: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Email] ❌ Failed to send email:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
