const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3001',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/venus_essentials',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_venus',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_venus',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Venus Essentials <no-reply@venusessentials.com>',

  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'VENUS',

  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,

  GST_NUMBER: process.env.GST_NUMBER || '',
  COMPANY_NAME: process.env.COMPANY_NAME || 'Venus Essentials',
  COMPANY_ADDRESS: process.env.COMPANY_ADDRESS || 'Ooty, Tamil Nadu, India',
  COMPANY_PHONE: process.env.COMPANY_PHONE || '',
  COMPANY_EMAIL: process.env.COMPANY_EMAIL || '',
  FREE_SHIPPING_THRESHOLD: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 500,
  DEFAULT_SHIPPING_CHARGE: parseFloat(process.env.DEFAULT_SHIPPING_CHARGE) || 50,
};

module.exports = env;
