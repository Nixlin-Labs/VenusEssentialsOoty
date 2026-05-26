const env = require('../config/env');
const Notification = require('../models/Notification');

/**
 * Send SMS (placeholder implementation).
 * Replace with actual SMS gateway (MSG91, Twilio, Fast2SMS) when ready.
 *
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS content
 * @param {string} purpose - Notification purpose
 */
const sendSMS = async (phone, message, purpose = 'otp') => {
  const notification = await Notification.create({
    type: 'sms',
    purpose,
    recipient: phone,
    content: message,
    status: 'pending',
  });

  try {
    // Placeholder — log to console in development
    console.log(`📱 [SMS] To: ${phone}`);
    console.log(`   Message: ${message}`);

    // When SMS provider is configured, implement here:
    // const response = await smsProvider.send({ to: phone, message, senderId: env.SMS_SENDER_ID });

    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();

    return { success: true };
  } catch (error) {
    notification.status = 'failed';
    notification.error = error.message;
    notification.retryCount += 1;
    await notification.save();

    console.error(`SMS send failed to ${phone}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via SMS.
 */
const sendOTPSMS = async (phone, otp) => {
  const message = `Your Venus Essentials verification code is ${otp}. Valid for 10 minutes. Do not share.`;
  return sendSMS(phone, message, 'otp');
};

module.exports = { sendSMS, sendOTPSMS };
