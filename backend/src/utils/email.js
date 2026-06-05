const nodemailer = require('nodemailer');
const env = require('../config/env');
const Notification = require('../models/Notification');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

/**
 * Send email and log to notifications.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.purpose - Notification purpose for logging
 */
const sendEmail = async ({ to, subject, html, purpose = 'general' }) => {
  const notification = await Notification.create({
    type: 'email',
    purpose,
    recipient: to,
    subject,
    content: html,
    status: 'pending',
  });

  try {
    // Skip sending if SMTP not configured
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.log(`📧 [DEV] Email to ${to}: ${subject}`);
      console.log(`   Content preview: ${html.substring(0, 200)}...`);
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
      return { success: true, messageId: 'dev-mode' };
    }

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();

    return { success: true, messageId: info.messageId };
  } catch (error) {
    notification.status = 'failed';
    notification.error = error.message;
    notification.retryCount += 1;
    await notification.save();

    console.error(`Email send failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP email.
 */
const sendOTPEmail = async (to, otp, name) => {
  const safeName = escapeHtml(name || 'there');
  const safeOtp = escapeHtml(otp);
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9F7F2; padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #2D4739; font-size: 28px; margin: 0;">Venus Essentials</h1>
      </div>
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(45, 71, 57, 0.06);">
        <h2 style="font-family: 'Playfair Display', serif; color: #1A1A1A; font-size: 22px;">Verify Your Account</h2>
        <p style="color: #424844; line-height: 1.6;">Hello ${safeName},</p>
        <p style="color: #424844; line-height: 1.6;">Your verification code is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2D4739; background: #F2EFE9; padding: 16px 32px; border-radius: 8px; display: inline-block;">${safeOtp}</span>
        </div>
        <p style="color: #727973; font-size: 14px; line-height: 1.6;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
      <p style="text-align: center; color: #727973; font-size: 12px; margin-top: 24px;">© ${new Date().getFullYear()} Venus Essentials. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to, subject: 'Your Venus Essentials Verification Code', html, purpose: 'otp' });
};

/**
 * Send order confirmation email.
 */
const sendOrderConfirmationEmail = async (to, order) => {
  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #F2EFE9;">${item.productName} - ${item.variantName}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F2EFE9; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #F2EFE9; text-align: right;">₹${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9F7F2; padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #2D4739; font-size: 28px; margin: 0;">Venus Essentials</h1>
      </div>
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(45, 71, 57, 0.06);">
        <h2 style="font-family: 'Playfair Display', serif; color: #1A1A1A; font-size: 22px;">Order Confirmed!</h2>
        <p style="color: #424844; line-height: 1.6;">Thank you for your order. We're preparing it with care.</p>
        <div style="background: #F2EFE9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #2D4739; font-weight: 600;">Order #${order.orderNumber}</p>
          <p style="margin: 4px 0; color: #727973; font-size: 14px;">${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #F2EFE9;">
              <th style="padding: 12px; text-align: left; color: #2D4739; font-size: 14px;">Item</th>
              <th style="padding: 12px; text-align: center; color: #2D4739; font-size: 14px;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #2D4739; font-size: 14px;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="border-top: 2px solid #2D4739; padding-top: 16px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #727973;">Subtotal</span><span style="color: #1A1A1A;">₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #727973;">GST</span><span style="color: #1A1A1A;">₹${order.gst.total.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #727973;">Shipping</span><span style="color: #1A1A1A;">₹${order.shippingCharge.toFixed(2)}</span>
          </div>
          ${order.discount > 0 ? `<div style="display: flex; justify-content: space-between; margin: 4px 0;"><span style="color: #2D4739;">Discount</span><span style="color: #2D4739;">-₹${order.discount.toFixed(2)}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 18px; font-weight: 700;">
            <span style="color: #1A1A1A;">Total</span><span style="color: #2D4739;">₹${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <p style="text-align: center; color: #727973; font-size: 12px; margin-top: 24px;">© ${new Date().getFullYear()} Venus Essentials. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to, subject: `Order Confirmed - #${order.orderNumber}`, html, purpose: 'order_confirmation' });
};

/**
 * Send dispatch notification email.
 */
const sendDispatchEmail = async (to, order) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9F7F2; padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #2D4739; font-size: 28px; margin: 0;">Venus Essentials</h1>
      </div>
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(45, 71, 57, 0.06);">
        <h2 style="font-family: 'Playfair Display', serif; color: #1A1A1A; font-size: 22px;">Your Order Has Been Dispatched!</h2>
        <p style="color: #424844; line-height: 1.6;">Great news! Order <strong>#${order.orderNumber}</strong> is on its way.</p>
        <div style="background: #F2EFE9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #424844;"><strong>Courier:</strong> ${order.courierName || 'N/A'}</p>
          <p style="margin: 4px 0; color: #424844;"><strong>Tracking Number:</strong> ${order.trackingNumber || 'N/A'}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: `Order Dispatched - #${order.orderNumber}`, html, purpose: 'order_dispatched' });
};

/**
 * Send password reset email.
 */
const sendPasswordResetEmail = async (to, otp, name) => {
  const safeName = escapeHtml(name || 'there');
  const safeOtp = escapeHtml(otp);
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9F7F2; padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #2D4739; font-size: 28px; margin: 0;">Venus Essentials</h1>
      </div>
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(45, 71, 57, 0.06);">
        <h2 style="font-family: 'Playfair Display', serif; color: #1A1A1A; font-size: 22px;">Reset Your Password</h2>
        <p style="color: #424844; line-height: 1.6;">Hello ${safeName},</p>
        <p style="color: #424844; line-height: 1.6;">Your password reset code is:</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2D4739; background: #F2EFE9; padding: 16px 32px; border-radius: 8px; display: inline-block;">${safeOtp}</span>
        </div>
        <p style="color: #727973; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: 'Reset Your Venus Essentials Password', html, purpose: 'password_reset' });
};

/**
 * Send refund notification email.
 */
const sendRefundEmail = async (to, order, refundAmount) => {
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F9F7F2; padding: 40px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', serif; color: #2D4739; font-size: 28px; margin: 0;">Venus Essentials</h1>
      </div>
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(45, 71, 57, 0.06);">
        <h2 style="font-family: 'Playfair Display', serif; color: #1A1A1A; font-size: 22px;">Refund Processed</h2>
        <p style="color: #424844; line-height: 1.6;">A refund of <strong>₹${refundAmount.toFixed(2)}</strong> has been initiated for order <strong>#${order.orderNumber}</strong>.</p>
        <p style="color: #727973; font-size: 14px;">The amount will be credited to your original payment method within 5-7 business days.</p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: `Refund Processed - #${order.orderNumber}`, html, purpose: 'refund' });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendOrderConfirmationEmail,
  sendDispatchEmail,
  sendPasswordResetEmail,
  sendRefundEmail,
};
