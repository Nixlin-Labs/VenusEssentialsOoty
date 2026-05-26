const crypto = require('crypto');

/**
 * Generate a random numeric OTP.
 * @param {number} length - OTP length (default 6)
 * @returns {string} - OTP code
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

/**
 * Create OTP data with expiry.
 * @param {number} expiryMinutes - Minutes until expiry (default 10)
 * @returns {object} - { code, expiresAt, attempts }
 */
const createOTP = (expiryMinutes = 10) => {
  return {
    code: generateOTP(),
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
    attempts: 0,
  };
};

/**
 * Verify OTP against stored data.
 * @param {object} storedOTP - { code, expiresAt, attempts }
 * @param {string} inputCode - User-provided OTP
 * @returns {object} - { valid, message }
 */
const verifyOTP = (storedOTP, inputCode) => {
  if (!storedOTP || !storedOTP.code) {
    return { valid: false, message: 'No OTP found. Please request a new one.' };
  }

  if (storedOTP.attempts >= 5) {
    return { valid: false, message: 'Too many attempts. Please request a new OTP.' };
  }

  if (new Date() > storedOTP.expiresAt) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOTP.code !== inputCode) {
    return { valid: false, message: 'Invalid OTP. Please try again.' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = { generateOTP, createOTP, verifyOTP };
