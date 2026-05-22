import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * EMAIL ROUTE — Premium Branded Transactional Emails
 * No paid service. Uses nodemailer SMTP (Gmail / any provider).
 *
 * Brand Details:
 *   Phone   : +918925878327
 *   Email   : info.thefarmersfactory@gmail.com
 *   Address : No 17, Kovalan street, 2nd main road, Uthandi kanathur, Chennai 600119
 *   Instagram: https://www.instagram.com/the_farmers_factory/
 *   Facebook : https://www.facebook.com/profile.php?id=100068904620757
 */

const FROM_EMAIL  = process.env.EMAIL_FROM  || 'Farmers Factory <info.thefarmersfactory@gmail.com>';
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'http://famersfactory.com';
const LOGO_URL    = `${SITE_URL}/logo.png`;

// ─── Brand Constants ──────────────────────────────────────────────────────────
const BRAND_PRIMARY   = '#E75129';
const BRAND_SECONDARY = '#FF8C00';
const BRAND_DARK      = '#1A1A1A';
const BRAND_LIGHT     = '#FFF8F5';
const BRAND_MUTED     = '#888888';
const BRAND_GREEN     = '#2E7D32';

const SUPPORT_PHONE   = '+91 89258 78327';
const SUPPORT_EMAIL   = 'info.thefarmersfactory@gmail.com';
const SUPPORT_HOURS   = 'Mon – Sat, 9:00 AM – 6:00 PM';
const SUPPORT_ADDRESS = 'No 17, Kovalan Street, 2nd Main Road, Uthandi Kanathur, Chennai – 600119';
const INSTAGRAM_URL   = 'https://www.instagram.com/the_farmers_factory/';
const FACEBOOK_URL    = 'https://www.facebook.com/profile.php?id=100068904620757';
const WHATSAPP_URL    = 'https://wa.me/918925878327';

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
    host, port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

// ─── Outer Email Wrapper ──────────────────────────────────────────────────────
function wrapEmail(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Farmers Factory</title>
</head>
<body style="margin:0;padding:0;background:#EFEFEF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFEFEF;padding:28px 0;">
    <tr>
      <td align="center" valign="top">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
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
    <td style="background:#FFFFFF;padding:18px 36px;border-bottom:2px solid #F5F5F5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="56" style="vertical-align:middle;padding-right:14px;">
            <img src="${LOGO_URL}" width="52" height="52" alt="Farmers Factory Logo"
                 style="display:block;border-radius:50%;border:2px solid #F0F0F0;object-fit:cover;" />
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0;font-size:18px;font-weight:900;color:${BRAND_PRIMARY};letter-spacing:0.5px;line-height:1.1;">FARMERS FACTORY</p>
            <p style="margin:2px 0 0;font-size:10px;color:${BRAND_MUTED};letter-spacing:2.5px;text-transform:uppercase;">Farm to Table in 24 Hours</p>
          </td>
          <td align="right" style="vertical-align:middle;">
            <a href="${SITE_URL}" style="font-size:11px;color:${BRAND_PRIMARY};text-decoration:none;font-weight:700;letter-spacing:0.5px;">Visit Website &rsaquo;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function heroBanner(headline: string, subline: string,
  gradient = `linear-gradient(135deg, ${BRAND_PRIMARY} 0%, ${BRAND_SECONDARY} 100%)`): string {
  return `
  <tr>
    <td style="background:${gradient};padding:44px 36px 38px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.70);">THE FARMERS FACTORY</p>
      <h1 style="margin:0;font-size:32px;font-weight:900;line-height:1.18;color:#FFFFFF;letter-spacing:-0.5px;">${headline}</h1>
      ${subline ? `<p style="margin:14px 0 0;font-size:14px;color:rgba(255,255,255,0.88);font-weight:500;line-height:1.5;">${subline}</p>` : ''}
    </td>
  </tr>`;
}

// ─── Order Status Tracker ─────────────────────────────────────────────────────
// activeStep: 0=Confirmed, 1=Shipped, 2=Out for Delivery, 3=Delivered
function statusTracker(activeStep: number): string {
  const steps = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const activeDot  = `width:18px;height:18px;border-radius:50%;background:${BRAND_PRIMARY};display:inline-block;box-shadow:0 0 0 4px rgba(231,81,41,0.18);`;
  const doneDot    = `width:18px;height:18px;border-radius:50%;background:${BRAND_PRIMARY};display:inline-block;`;
  const pendingDot = `width:18px;height:18px;border-radius:50%;background:#E0E0E0;display:inline-block;`;

  const dotStyle = (i: number) => i < activeStep ? doneDot : i === activeStep ? activeDot : pendingDot;
  const labelColor = (i: number) => i <= activeStep ? BRAND_PRIMARY : '#C0C0C0';
  const labelWeight = (i: number) => i <= activeStep ? '700' : '400';
  const lineColor = (i: number) => i < activeStep ? BRAND_PRIMARY : '#E0E0E0';

  return `
  <tr>
    <td style="padding:28px 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${steps.map((_, i) => {
            const dot = `<td align="center" style="width:18px;"><div style="${dotStyle(i)}"></div></td>`;
            if (i < steps.length - 1) {
              const line = `<td style="padding-bottom:2px;"><div style="height:3px;background:${lineColor(i)};border-radius:2px;margin:0 4px;"></div></td>`;
              return dot + line;
            }
            return dot;
          }).join('')}
        </tr>
        <tr>
          ${steps.map((label, i) =>
            `<td align="center" colspan="${i < steps.length - 1 ? 2 : 1}" style="padding-top:8px;font-size:10px;font-weight:${labelWeight(i)};color:${labelColor(i)};letter-spacing:0.3px;white-space:nowrap;">${label}</td>`
          ).join('')}
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function sectionHeading(text: string): string {
  return `
  <tr>
    <td style="padding:20px 36px 10px;">
      <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${BRAND_DARK};">${text}</p>
    </td>
  </tr>`;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function divider(): string {
  return `<tr><td style="padding:0 36px;"><div style="height:1px;background:#F2F2F2;"></div></td></tr>`;
}

// ─── Order Item Row (with product image) ──────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function orderItemRow(item: any): string {
  const price    = Number(item.price_at_purchase || item.price || 0);
  const qty      = Number(item.quantity || 1);
  const lineTotal = (price * qty).toFixed(2);
  const imgSrc   = item.products?.image_url || item.image_url || '';
  const name     = item.products?.name || item.name || 'Product';
  const initial  = name.charAt(0).toUpperCase();

  const imgBlock = imgSrc
    ? `<img src="${imgSrc}" width="72" height="72" alt="${name}"
           style="display:block;width:72px;height:72px;border-radius:12px;object-fit:cover;border:1px solid #EEEEEE;" />`
    : `<table width="72" height="72" cellpadding="0" cellspacing="0" border="0"
             style="width:72px;height:72px;border-radius:12px;background:${BRAND_LIGHT};border:1px solid #EEEEE;">
         <tr><td align="center" valign="middle"
                 style="font-size:28px;font-weight:900;color:${BRAND_PRIMARY};">${initial}</td></tr>
       </table>`;

  return `
  <tr>
    <td style="padding:14px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="72" style="vertical-align:middle;padding-right:16px;">${imgBlock}</td>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 5px;font-size:14px;font-weight:700;color:${BRAND_DARK};line-height:1.3;">${name}</p>
            <p style="margin:0 0 3px;font-size:12px;color:${BRAND_MUTED};">
              Qty: <strong style="color:${BRAND_DARK};">${qty}</strong>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              Unit Price: <strong style="color:${BRAND_DARK};">₹${price.toFixed(2)}</strong>
            </p>
          </td>
          <td align="right" style="vertical-align:middle;white-space:nowrap;">
            <p style="margin:0;font-size:16px;font-weight:900;color:${BRAND_PRIMARY};">₹${lineTotal}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Price Breakdown ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function priceBreakdown(data: any): string {
  const total       = Number(data.total || data.total_amount || 0);
  const subtotal    = Number(data.subtotal || 0);
  const deliveryFee = Number(data.deliveryFee || data.delivery_fee || 0);
  const discount    = Number(data.discount || 0);
  const base        = subtotal > 0 ? subtotal : total / 1.18;
  const igst        = subtotal > 0 ? (total - subtotal - deliveryFee + discount) : (total - base);

  const row = (label: string, value: string, color = '#555555', bold = false) =>
    `<tr>
       <td style="padding:5px 0;font-size:13px;color:${color};font-weight:${bold ? '900' : '400'};">${label}</td>
       <td style="padding:5px 0;font-size:13px;color:${color};text-align:right;font-weight:${bold ? '900' : '400'};">${value}</td>
     </tr>`;

  return `
  <tr>
    <td style="padding:6px 36px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="border-top:1px solid #EEEEEE;margin-top:6px;padding-top:4px;">
        ${subtotal > 0 ? row('Subtotal (before tax)', `₹${subtotal.toFixed(2)}`) : ''}
        ${subtotal > 0 ? row('IGST (18%)', `₹${igst.toFixed(2)}`) : ''}
        ${deliveryFee > 0 ? row('Delivery Fee', `₹${deliveryFee.toFixed(2)}`) : row('Delivery', 'FREE 🚚', BRAND_GREEN)}
        ${discount > 0 ? row('Coupon Discount', `– ₹${discount.toFixed(2)}`, BRAND_GREEN) : ''}
        <tr><td colspan="2" style="padding:10px 0 4px;"><div style="height:1px;background:#EEEEEE;"></div></td></tr>
        ${row('Grand Total', `₹${total.toFixed(2)}`, BRAND_PRIMARY, true)}
      </table>
    </td>
  </tr>`;
}

// ─── Delivery Details Card ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deliveryDetails(data: any): string {
  const address       = data.deliveryAddress || '';
  const paymentMethod = data.paymentMethod || data.payment_method || '';
  const orderDate     = data.orderDate || '';
  const payLabel      = paymentMethod.toLowerCase().includes('cod')
    ? '💵 Cash on Delivery'
    : paymentMethod
      ? `💳 ${paymentMethod}`
      : '';

  if (!address && !payLabel && !orderDate) return '';

  const addressLines = address.split('\n').filter(Boolean);
  const customerName = addressLines[0] || '';
  const phone        = addressLines[1] || '';
  const addrBody     = addressLines.slice(2).join(', ') || addressLines.join(', ');

  return `
  ${sectionHeading('DELIVERY & ORDER DETAILS')}
  <tr>
    <td style="padding:6px 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#F9F9F9;border-radius:14px;border:1px solid #EEEEEE;">
        <tr>
          <td style="padding:20px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">

              ${customerName ? `
              <tr>
                <td width="28" style="vertical-align:top;padding-right:10px;padding-top:2px;font-size:16px;">👤</td>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:13px;font-weight:700;color:${BRAND_DARK};">${customerName}</p>
                  ${phone ? `<p style="margin:2px 0 0;font-size:12px;color:${BRAND_MUTED};">${phone}</p>` : ''}
                </td>
              </tr>` : ''}

              ${addrBody ? `
              <tr><td colspan="2" style="padding:10px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" style="vertical-align:top;padding-right:10px;padding-top:2px;font-size:16px;">📍</td>
                    <td style="vertical-align:top;font-size:13px;color:#555555;line-height:1.6;">${addrBody}</td>
                  </tr>
                </table>
              </td></tr>` : ''}

              ${payLabel ? `
              <tr><td colspan="2" style="padding:10px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" style="vertical-align:middle;padding-right:10px;font-size:16px;">🧾</td>
                    <td style="vertical-align:middle;font-size:13px;color:#555555;font-weight:600;">${payLabel}</td>
                  </tr>
                </table>
              </td></tr>` : ''}

              <tr><td colspan="2" style="padding:10px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" style="vertical-align:middle;padding-right:10px;font-size:16px;">📅</td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-size:12px;color:${BRAND_MUTED};">Estimated Delivery</p>
                      <p style="margin:2px 0 0;font-size:13px;font-weight:700;color:${BRAND_GREEN};">Within 24 hours of harvest 🌿</p>
                    </td>
                  </tr>
                </table>
              </td></tr>

              ${orderDate ? `
              <tr><td colspan="2" style="padding:10px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" style="vertical-align:middle;padding-right:10px;font-size:16px;">🕐</td>
                    <td style="vertical-align:middle;font-size:12px;color:${BRAND_MUTED};">Order placed on ${orderDate}</td>
                  </tr>
                </table>
              </td></tr>` : ''}

            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── "What Happens Next?" Section ────────────────────────────────────────────
function whatHappensNext(steps: string[]): string {
  return `
  ${sectionHeading("WHAT HAPPENS NEXT?")}
  <tr>
    <td style="padding:4px 36px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${steps.map((step, i) => `
        <tr>
          <td width="28" style="vertical-align:top;padding-right:12px;padding-top:2px;">
            <div style="width:24px;height:24px;border-radius:50%;background:${BRAND_PRIMARY};text-align:center;line-height:24px;font-size:11px;font-weight:900;color:#FFFFFF;">${i + 1}</div>
          </td>
          <td style="vertical-align:top;padding-bottom:14px;font-size:13px;color:#555555;line-height:1.5;">${step}</td>
        </tr>`).join('')}
      </table>
    </td>
  </tr>`;
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function ctaButton(label: string, url: string, secondary = false): string {
  const bg    = secondary ? '#FFFFFF' : BRAND_PRIMARY;
  const color = secondary ? BRAND_PRIMARY : '#FFFFFF';
  const border = secondary ? `border:2px solid ${BRAND_PRIMARY};` : '';
  return `
  <tr>
    <td style="padding:8px 36px 28px;">
      <a href="${url}"
         style="display:block;background:${bg};color:${color} !important;text-align:center;
                padding:16px 32px;border-radius:12px;font-size:13px;font-weight:900;
                letter-spacing:2px;text-transform:uppercase;text-decoration:none;${border}">
        ${label} &rsaquo;
      </a>
    </td>
  </tr>`;
}

// ─── Support Block ────────────────────────────────────────────────────────────
function supportBlock(): string {
  return `
  <tr>
    <td style="padding:4px 36px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#FFF8F5;border-radius:14px;border:1px solid #FCE8E1;">
        <tr>
          <td style="padding:20px 22px;">
            <p style="margin:0 0 14px;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:${BRAND_PRIMARY};">🤝 Need Help?</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="22" style="vertical-align:middle;padding-right:10px;font-size:14px;">📞</td>
                <td style="vertical-align:middle;font-size:13px;color:${BRAND_DARK};font-weight:600;">
                  <a href="tel:${SUPPORT_PHONE.replace(/\s/g,'')}" style="color:${BRAND_DARK};text-decoration:none;">${SUPPORT_PHONE}</a>
                </td>
              </tr>
              <tr><td colspan="2" style="padding:8px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="22" style="vertical-align:middle;padding-right:10px;font-size:14px;">📧</td>
                    <td style="vertical-align:middle;font-size:13px;">
                      <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_PRIMARY};text-decoration:none;font-weight:600;">${SUPPORT_EMAIL}</a>
                    </td>
                  </tr>
                </table>
              </td></tr>
              <tr><td colspan="2" style="padding:8px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="22" style="vertical-align:middle;padding-right:10px;font-size:14px;">⏰</td>
                    <td style="vertical-align:middle;font-size:12px;color:${BRAND_MUTED};">${SUPPORT_HOURS}</td>
                  </tr>
                </table>
              </td></tr>
              <tr><td colspan="2" style="padding:8px 0 0;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="22" style="vertical-align:top;padding-right:10px;padding-top:2px;font-size:14px;">📍</td>
                    <td style="vertical-align:top;font-size:12px;color:${BRAND_MUTED};line-height:1.5;">${SUPPORT_ADDRESS}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Security Alert (OTP emails) ─────────────────────────────────────────────
function securityAlert(): string {
  return `
  <tr>
    <td style="padding:0 36px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background:#3B0E0E;border-radius:12px;">
        <tr>
          <td style="padding:20px 22px;">
            <p style="margin:0 0 10px;font-size:14px;font-weight:900;color:#FFFFFF;">⚠️ Security Notice</p>
            <p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.80);line-height:1.6;">
              Scammers may try to reach you pretending to be from the Farmers Factory team. <strong>This is not us.</strong>
            </p>
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:12px;color:rgba(255,255,255,0.65);line-height:2.0;">
                  • We will <strong>never</strong> call you to ask for your OTP<br/>
                  • We will <strong>never</strong> ask for payments through a link<br/>
                  • We will <strong>never</strong> offer free gifts via phone
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;font-size:12px;color:rgba(255,255,255,0.50);">Keep Shopping Smart! — Team Farmers Factory</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Greeting ─────────────────────────────────────────────────────────────────
function greeting(name: string, message: string): string {
  const firstName = (name || 'Valued Customer').split(' ')[0];
  return `
  <tr>
    <td style="padding:28px 36px 10px;">
      <p style="margin:0 0 10px;font-size:18px;font-weight:800;color:${BRAND_DARK};">Hi ${firstName},</p>
      <p style="margin:0;font-size:14px;color:#555555;line-height:1.75;">${message}</p>
    </td>
  </tr>`;
}

// ─── Social Media Footer Row ──────────────────────────────────────────────────
function socialRow(): string {
  // Inline SVG icons — no external CDN, works in all email clients
  const ig = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#E1306C"/>
    <path d="M12 7.5C9.51 7.5 7.5 9.51 7.5 12C7.5 14.49 9.51 16.5 12 16.5C14.49 16.5 16.5 14.49 16.5 12C16.5 9.51 14.49 7.5 12 7.5ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z" fill="white"/>
    <circle cx="16.8" cy="7.2" r="1.05" fill="white"/>
  </svg>`;

  const fb = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1877F2"/>
    <path d="M13.5 8.5H15V6H13C11.34 6 10 7.34 10 9V10.5H8V13H10V19H12.5V13H14.5L15 10.5H12.5V9C12.5 8.724 12.724 8.5 13 8.5H13.5Z" fill="white"/>
  </svg>`;

  const wa = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#25D366"/>
    <path d="M12 4C7.59 4 4 7.59 4 12C4 13.42 4.38 14.75 5.04 15.9L4 20L8.26 18.98C9.37 19.58 10.64 19.92 12 19.92C16.41 19.92 20 16.33 20 11.96C20 7.59 16.41 4 12 4ZM16.07 15.35C15.87 15.91 14.96 16.41 14.5 16.46C14.04 16.51 13.6 16.68 11.42 15.83C8.83 14.83 7.22 12.2 7.1 12.04C6.98 11.88 6.09 10.72 6.09 9.52C6.09 8.32 6.74 7.73 6.97 7.49C7.2 7.25 7.47 7.19 7.63 7.19C7.79 7.19 7.95 7.19 8.09 7.2C8.25 7.21 8.47 7.14 8.68 7.65C8.9 8.17 9.41 9.37 9.47 9.49C9.53 9.61 9.57 9.75 9.49 9.91C9.41 10.07 9.37 10.17 9.25 10.31C9.13 10.45 9 10.62 8.9 10.72C8.78 10.84 8.66 10.97 8.8 11.21C8.94 11.45 9.41 12.21 10.12 12.84C11.03 13.65 11.79 13.91 12.03 14.03C12.27 14.15 12.41 14.13 12.55 13.97C12.69 13.81 13.14 13.29 13.3 13.05C13.46 12.81 13.62 12.85 13.84 12.93C14.06 13.01 15.25 13.6 15.49 13.72C15.73 13.84 15.89 13.9 15.95 14.0C16.01 14.12 16.01 14.67 15.79 15.23L16.07 15.35Z" fill="white"/>
  </svg>`;

  return `
  <tr>
    <td style="padding:20px 36px 14px;text-align:center;border-top:1px solid #333333;">
      <p style="margin:0 0 16px;font-size:11px;color:#888888;letter-spacing:2px;text-transform:uppercase;">Follow Us</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="padding:0 8px;">
            <a href="${INSTAGRAM_URL}" title="Instagram" style="text-decoration:none;">${ig}</a>
          </td>
          <td style="padding:0 8px;">
            <a href="${FACEBOOK_URL}" title="Facebook" style="text-decoration:none;">${fb}</a>
          </td>
          <td style="padding:0 8px;">
            <a href="${WHATSAPP_URL}" title="WhatsApp" style="text-decoration:none;">${wa}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── Email Footer ─────────────────────────────────────────────────────────────
function emailFooter(): string {
  return `
  <tr>
    <td style="background:#1A1A1A;border-radius:0 0 20px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <!-- Logo + Tagline -->
        <tr>
          <td style="padding:28px 36px 0;" align="center">
            <img src="${LOGO_URL}" width="44" height="44" alt="FF Logo"
                 style="display:block;border-radius:50%;margin:0 auto 12px;" />
            <p style="margin:0;font-size:17px;font-weight:900;color:#FFFFFF;letter-spacing:1px;">FARMERS FACTORY</p>
            <p style="margin:4px 0 0;font-size:10px;color:#777777;letter-spacing:2.5px;text-transform:uppercase;">Farm to Table in 24 Hours</p>
          </td>
        </tr>
        <!-- Social Icons -->
        ${socialRow()}
        <!-- Address + Legal -->
        <tr>
          <td style="padding:0 36px 28px;" align="center">
            <p style="margin:0 0 8px;font-size:11px;color:#666666;line-height:1.7;">
              ${SUPPORT_ADDRESS}
            </p>
            <p style="margin:0 0 12px;font-size:11px;color:#666666;line-height:1.7;">
              © ${new Date().getFullYear()} Farmers Factory. All rights reserved.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td style="padding:0 8px;">
                  <a href="${SITE_URL}/privacy" style="font-size:11px;color:#888888;text-decoration:none;">Privacy Policy</a>
                </td>
                <td style="font-size:11px;color:#444444;">|</td>
                <td style="padding:0 8px;">
                  <a href="${SITE_URL}/profile" style="font-size:11px;color:#888888;text-decoration:none;">Manage Preferences</a>
                </td>
                <td style="font-size:11px;color:#444444;">|</td>
                <td style="padding:0 8px;">
                  <a href="${SITE_URL}" style="font-size:11px;color:${BRAND_PRIMARY};text-decoration:none;font-weight:700;">Visit Website</a>
                </td>
              </tr>
            </table>
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

  // Helper — produces item list + delivery + price block for order emails
  const orderBody = (trackerStep: number) => `
    ${items.length > 0 ? `
      ${sectionHeading('YOUR ORDER')}
      ${divider()}
      ${items.map(orderItemRow).join(divider())}
      ${divider()}
      ${priceBreakdown(data)}
    ` : ''}
    ${statusTracker(trackerStep)}
    ${deliveryDetails(data)}
  `;

  let rows = '';

  switch (template) {

    // ── OTP / Security Code ────────────────────────────────────────────────────
    case 'security_code': {
      rows = `
        ${logoBar()}
        ${heroBanner('Verify Your Identity 🔐',
          'Enter the one-time code below to access your account.',
          `linear-gradient(135deg, #1A237E 0%, #3949AB 100%)`)}
        ${greeting(customerName,
          'We received a sign-in request for your Farmers Factory account. Use the code below — it expires in 10 minutes.')}
        <tr>
          <td style="padding:10px 36px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:${BRAND_LIGHT};border-radius:14px;border:2px dashed ${BRAND_PRIMARY};">
              <tr>
                <td style="padding:30px;text-align:center;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:${BRAND_MUTED};">Your Verification Code</p>
                  <p style="margin:0;font-size:56px;font-weight:900;letter-spacing:16px;color:${BRAND_DARK};font-family:'Courier New',Courier,monospace;">${data.code}</p>
                  <p style="margin:14px 0 0;font-size:12px;color:${BRAND_MUTED};">⏱ This code expires in <strong>10 minutes</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px 20px;">
            <p style="margin:0;font-size:13px;color:${BRAND_MUTED};line-height:1.75;">
              If you didn't request this code, please ignore this email — your account remains safe.
              Someone may have entered your email address by mistake.
            </p>
          </td>
        </tr>
        ${securityAlert()}
        ${supportBlock()}
      `;
      break;
    }

    // ── Order Confirmed ────────────────────────────────────────────────────────
    case 'order_confirmation':
    case 'order_confirmed': {
      rows = `
        ${logoBar()}
        ${heroBanner('Happiness Coming Your Way ✦',
          'Your order is confirmed — our farmers are on it!')}
        ${greeting(customerName,
          `Your order <strong>#${orderNumber}</strong> has been confirmed! Our farmers are carefully harvesting the freshest produce just for you.`)}
        <tr>
          <td style="padding:4px 36px 0;">
            <p style="margin:0;font-size:13px;background:#E8F5E9;color:${BRAND_GREEN};padding:12px 18px;border-radius:10px;font-weight:700;">
              📦 Expected delivery: <strong>Within 24 hours of harvest</strong>
            </p>
          </td>
        </tr>
        ${orderBody(0)}
        ${whatHappensNext([
          'Our team has received your order and is preparing it.',
          'You will receive a <strong>Shipped</strong> email once your order is dispatched.',
          'Our delivery partner will bring it to your doorstep within 24 hours.',
        ])}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Order Processing / Packed ──────────────────────────────────────────────
    case 'order_processing':
    case 'order_packed': {
      rows = `
        ${logoBar()}
        ${heroBanner('Getting It Ready For You 📦',
          'Your order is being carefully packed by our team.')}
        ${greeting(customerName,
          `Great news! Your order <strong>#${orderNumber}</strong> is being packed and will be dispatched very soon.`)}
        ${orderBody(0)}
        ${whatHappensNext([
          'Your items are being packed with care.',
          "You'll receive a Shipped notification once it's on the way.",
          'Expected delivery: within 24 hours of dispatch.',
        ])}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Order Shipped ──────────────────────────────────────────────────────────
    case 'order_shipped': {
      rows = `
        ${logoBar()}
        ${heroBanner('Happiness Coming Your Way 🚀',
          'Your package has been dispatched and is on its way!')}
        ${greeting(customerName,
          `Your order <strong>#${orderNumber}</strong> has been shipped! Our delivery team is heading to your doorstep.`)}
        ${orderBody(1)}
        ${whatHappensNext([
          'Your order is with our delivery partner.',
          'You\'ll receive an <strong>Out for Delivery</strong> update when it\'s nearby.',
          'Please keep your phone available for the delivery call.',
        ])}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Out for Delivery ───────────────────────────────────────────────────────
    case 'order_out_for_delivery': {
      rows = `
        ${logoBar()}
        ${heroBanner('Almost There! 🛵',
          'Your package is out for delivery — arriving today!')}
        ${greeting(customerName,
          `Your package with order <strong>#${orderNumber}</strong> is out for delivery and will reach your doorstep within a few hours.`)}
        ${orderBody(2)}
        ${whatHappensNext([
          'Our delivery executive is on the way to your address.',
          'Please be available or arrange someone to receive the package.',
          'For COD orders, please keep the exact amount ready.',
        ])}
        ${ctaButton('TRACK YOUR ORDER', ordersUrl)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Order Delivered ────────────────────────────────────────────────────────
    case 'order_delivered': {
      rows = `
        ${logoBar()}
        ${heroBanner('Delivered with Love 🌿',
          'Your fresh farm produce has arrived!',
          `linear-gradient(135deg, ${BRAND_GREEN} 0%, #43A047 100%)`)}
        ${greeting(customerName,
          `Your order <strong>#${orderNumber}</strong> has been successfully delivered. We hope you enjoy the freshest harvest straight from our farms!`)}
        ${orderBody(3)}
        <tr>
          <td style="padding:4px 36px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:${BRAND_LIGHT};border-radius:14px;border:1px solid #FCE8E1;">
              <tr>
                <td style="padding:20px 22px;">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:${BRAND_DARK};">🌟 Loved your order?</p>
                  <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
                    Share your experience — your feedback helps our farmers grow better produce for you!
                    Follow us on Instagram <a href="${INSTAGRAM_URL}" style="color:${BRAND_PRIMARY};font-weight:700;text-decoration:none;">@the_farmers_factory</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${ctaButton('VIEW MY ORDERS', ordersUrl)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Order Cancelled ────────────────────────────────────────────────────────
    case 'order_cancelled': {
      rows = `
        ${logoBar()}
        ${heroBanner('Order Cancelled ❌',
          'We\'re sorry to see this order go.',
          `linear-gradient(135deg, #616161 0%, #9E9E9E 100%)`)}
        ${greeting(customerName,
          `Your order <strong>#${orderNumber}</strong> has been cancelled. If a payment was made, a refund will be processed to your original payment method within <strong>5–7 business days</strong>.`)}
        ${items.length > 0 ? `
          ${sectionHeading('CANCELLED ITEMS')}
          ${divider()}
          ${items.map(orderItemRow).join(divider())}
          ${divider()}
          ${priceBreakdown(data)}
        ` : ''}
        <tr>
          <td style="padding:4px 36px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#FFF3E0;border-radius:12px;border:1px solid #FFE0B2;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#E65100;">Refund Information</p>
                  <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
                    Refunds for online payments are processed within 5–7 business days back to your original payment method.
                    COD orders have no refund applicable.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${ctaButton('SHOP AGAIN', SITE_URL)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Order Rejected ─────────────────────────────────────────────────────────
    case 'order_rejected': {
      rows = `
        ${logoBar()}
        ${heroBanner('Order Could Not Be Fulfilled 🚫',
          'We sincerely apologise for the inconvenience.',
          `linear-gradient(135deg, #B71C1C 0%, #E53935 100%)`)}
        ${greeting(customerName,
          `Unfortunately, your order <strong>#${orderNumber}</strong> could not be fulfilled due to stock or delivery constraints. Any payment made will be refunded within <strong>5–7 business days</strong>.`)}
        ${ctaButton('EXPLORE OTHER PRODUCTS', SITE_URL)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Welcome Email ──────────────────────────────────────────────────────────
    case 'welcome': {
      const firstName = customerName.split(' ')[0];
      rows = `
        ${logoBar()}
        ${heroBanner(`Welcome to the Farm, ${firstName}! 🌿`,
          'Your journey to fresh, organic produce starts here.')}
        ${greeting(customerName,
          'We\'re so thrilled to have you in our organic family! Get ready for the freshest harvest delivered straight to your doorstep.')}
        <tr>
          <td style="padding:4px 36px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:${BRAND_LIGHT};border-radius:14px;">
              <tr>
                <td style="padding:22px 22px;">
                  <p style="margin:0 0 16px;font-size:11px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:${BRAND_DARK};">Your Benefits Include:</p>
                  <table cellpadding="0" cellspacing="0" border="0">
                    ${[
                      ['🥦', '100% Organic, Chemical-Free', 'Directly sourced from our verified farms.'],
                      ['🚚', 'Farm to Table in 24 Hours',   'Delivered fresh the same day of harvest.'],
                      ['💰', 'WELCOME10 — 10% Off',         'Use this code on your very first order!'],
                      ['📞', 'Dedicated Support',           'Call us at +91 89258 78327, Mon–Sat 9AM–6PM.'],
                    ].map(([icon, title, sub]) => `
                    <tr>
                      <td width="36" style="vertical-align:top;padding:6px 14px 6px 0;font-size:22px;">${icon}</td>
                      <td style="padding:6px 0 6px;">
                        <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND_DARK};">${title}</p>
                        <p style="margin:2px 0 0;font-size:12px;color:${BRAND_MUTED};">${sub}</p>
                      </td>
                    </tr>`).join('')}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${ctaButton('START SHOPPING', SITE_URL)}
        ${supportBlock()}
      `;
      break;
    }

    // ── Contact Enquiry (internal — sent to admin) ─────────────────────────────
    case 'contact_inquiry': {
      rows = `
        ${logoBar()}
        ${heroBanner('📬 New Contact Form Enquiry', 'Someone has reached out via the website')}
        <tr>
          <td style="padding:24px 36px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:${BRAND_LIGHT};border-radius:12px;">
              <tr>
                <td style="padding:18px 20px;">
                  <p style="margin:4px 0;font-size:14px;color:${BRAND_DARK};"><strong>Name:</strong> ${data.name}</p>
                  <p style="margin:4px 0;font-size:14px;color:${BRAND_DARK};"><strong>Email:</strong>
                    <a href="mailto:${data.email}" style="color:${BRAND_PRIMARY};text-decoration:none;">${data.email}</a>
                  </p>
                  <p style="margin:4px 0;font-size:14px;color:${BRAND_DARK};"><strong>Subject:</strong> ${data.subject}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 36px 28px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${BRAND_MUTED};">Message</p>
            <div style="background:#FAFAFA;border-left:4px solid ${BRAND_PRIMARY};padding:16px 20px;border-radius:0 10px 10px 0;font-size:14px;color:#333333;line-height:1.75;white-space:pre-wrap;">${data.message}</div>
          </td>
        </tr>
      `;
      break;
    }

    // ── Generic Fallback ───────────────────────────────────────────────────────
    default: {
      const statusTitle = template.replace('order_', '').replace(/_/g, ' ').toUpperCase();
      rows = `
        ${logoBar()}
        ${heroBanner(`Order ${statusTitle}`, data.message || 'Your order status has been updated.')}
        ${greeting(customerName,
          data.message || `Your order <strong>#${orderNumber}</strong> status has been updated to <strong>${statusTitle}</strong>.`)}
        ${orderBody(0)}
        ${ctaButton('VIEW MY ORDERS', ordersUrl)}
        ${supportBlock()}
      `;
    }
  }

  return wrapEmail(`<table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`);
}

// ─── API Route Handler ─────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Email] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in env.');
    return NextResponse.json({ skipped: true, message: 'Email service not configured' }, { status: 200 });
  }

  try {
    const { to, subject, template, data } = await req.json();

    if (!to || !subject || !template) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, template' }, { status: 400 });
    }

    // ── Server-side Supabase fetch for order emails ──────────────────────────
    let items: unknown[] = [];
    const isOrderEmail = template.startsWith('order_') || template === 'order_confirmation';
    const orderId      = data?.orderId;

    if (isOrderEmail && orderId) {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          // Fetch order items with product images
          const { data: orderItems } = await supabase
            .from('order_items')
            .select('*, products(name, image_url, unit)')
            .eq('order_id', orderId);

          if (orderItems && orderItems.length > 0) items = orderItems;

          // Fetch full order record for delivery address, payment, dates
          const { data: orderRow } = await supabase
            .from('orders')
            .select('delivery_address, payment_method, created_at, subtotal, delivery_fee, discount, total_amount')
            .eq('id', orderId)
            .single();

          if (orderRow) {
            if (!data.deliveryAddress) data.deliveryAddress = orderRow.delivery_address;
            if (!data.paymentMethod)   data.paymentMethod   = orderRow.payment_method;
            if (!data.subtotal)        data.subtotal        = orderRow.subtotal;
            if (!data.delivery_fee)    data.delivery_fee    = orderRow.delivery_fee;
            if (!data.discount)        data.discount        = orderRow.discount;
            if (!data.total && !data.total_amount) data.total = orderRow.total_amount;
            if (!data.orderDate && orderRow.created_at) {
              data.orderDate = new Date(orderRow.created_at).toLocaleString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              });
            }
          }

          // Fetch customer full name if not provided
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
        console.warn('[Email] Could not fetch order details, sending without them:', fetchErr);
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
