require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { User, Role, Category, Settings, CmsPage } = require('../models');

const seed = async () => {
  await connectDB();
  console.log('🌱 Starting database seed...');

  // --- Roles ---
  const roles = [
    { name: 'super_admin', displayName: 'Super Admin', permissions: ['*'], isSystem: true, description: 'Full platform access' },
    { name: 'manager', displayName: 'Manager', permissions: ['product:*', 'category:*', 'inventory:*', 'order:*', 'review:*', 'coupon:*', 'customer:view', 'report:view'], isSystem: true, description: 'Operational management' },
    { name: 'inventory_staff', displayName: 'Inventory Staff', permissions: ['product:view', 'inventory:view', 'inventory:update'], isSystem: true, description: 'Stock management only' },
    { name: 'content_manager', displayName: 'Content Manager', permissions: ['cms:*', 'banner:*'], isSystem: true, description: 'CMS and banner management' },
  ];

  for (const role of roles) {
    await Role.findOneAndUpdate({ name: role.name }, role, { upsert: true });
  }
  console.log('✅ Roles seeded');

  // --- Super Admin User ---
  const adminExists = await User.findOne({ role: 'super_admin' });
  if (!adminExists) {
    await User.create({
      name: 'Venus Admin',
      email: 'admin@venusessentials.com',
      phone: '9876543210',
      password: 'Admin@1234',
      role: 'super_admin',
      isVerified: true,
    });
    console.log('✅ Super Admin created (admin@venusessentials.com / Admin@1234)');
  }

  // --- Categories ---
  const categories = [
    { name: 'Coffee Powders', slug: 'coffee-powders', description: 'Premium handcrafted coffee blends from the Nilgiri hills', sortOrder: 1 },
    { name: 'Tea Powders', slug: 'tea-powders', description: 'Aromatic tea blends sourced from Ooty estates', sortOrder: 2 },
    { name: 'Essential Oils', slug: 'essential-oils', description: 'Pure, cold-pressed essential oils for wellness', sortOrder: 3 },
    { name: 'Chocolates', slug: 'chocolates', description: 'Artisanal chocolates crafted with the finest ingredients', sortOrder: 4 },
    { name: 'Wellness Products', slug: 'wellness-products', description: 'Natural wellness and self-care essentials', sortOrder: 5 },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, { ...cat, isActive: true }, { upsert: true });
  }
  console.log('✅ Categories seeded');

  // --- CMS Pages ---
  const pages = [
    { title: 'About Us', slug: 'about-us', template: 'about', content: '<h2>Our Story</h2><p>Venus Essentials is a 40+ year heritage wellness brand from the serene hills of Ooty. We have been crafting premium coffee powders, tea blends, essential oils, and chocolates using traditional methods passed down through generations.</p><p>Our commitment to quality and authenticity has made us a trusted name in wellness and gourmet products.</p>', isActive: true, sortOrder: 1 },
    { title: 'Our Heritage', slug: 'our-heritage', template: 'heritage', content: '<h2>40+ Years of Excellence</h2><p>Founded in the heart of the Nilgiri hills, Venus Essentials began as a small family business dedicated to preserving the rich traditions of Ooty. Over four decades, we have grown while maintaining the artisanal quality that defines our brand.</p>', isActive: true, sortOrder: 2 },
    { title: 'Privacy Policy', slug: 'privacy-policy', template: 'policy', content: '<h2>Privacy Policy</h2><p>At Venus Essentials, we value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data.</p>', isActive: true, sortOrder: 3 },
    { title: 'Terms & Conditions', slug: 'terms-and-conditions', template: 'policy', content: '<h2>Terms & Conditions</h2><p>By using our website and services, you agree to the following terms and conditions.</p>', isActive: true, sortOrder: 4 },
    { title: 'Shipping Policy', slug: 'shipping-policy', template: 'policy', content: '<h2>Shipping Policy</h2><p>We ship across India. Orders above ₹500 qualify for free shipping. Standard delivery takes 5-7 business days.</p>', isActive: true, sortOrder: 5 },
    { title: 'Refund Policy', slug: 'refund-policy', template: 'policy', content: '<h2>Refund Policy</h2><p>We offer full refunds for orders cancelled before dispatch. Refunds are processed within 5-7 business days to your original payment method.</p>', isActive: true, sortOrder: 6 },
    { title: 'Contact Us', slug: 'contact-us', template: 'contact', content: '<h2>Get in Touch</h2><p>We would love to hear from you. Reach out to us for any queries or feedback.</p>', isActive: true, sortOrder: 7 },
  ];

  for (const page of pages) {
    await CmsPage.findOneAndUpdate({ slug: page.slug }, page, { upsert: true });
  }
  console.log('✅ CMS Pages seeded');

  // --- Settings ---
  const settings = [
    { key: 'gst_number', value: '', group: 'tax', label: 'GST Number' },
    { key: 'default_gst_percentage', value: 18, group: 'tax', label: 'Default GST %' },
    { key: 'free_shipping_threshold', value: 500, group: 'shipping', label: 'Free Shipping Threshold (₹)' },
    { key: 'default_shipping_charge', value: 50, group: 'shipping', label: 'Default Shipping Charge (₹)' },
    { key: 'invoice_prefix', value: 'INV', group: 'invoice', label: 'Invoice Prefix' },
    { key: 'company_name', value: 'Venus Essentials', group: 'general', label: 'Company Name' },
    { key: 'company_address', value: 'Ooty, Tamil Nadu, India', group: 'general', label: 'Company Address' },
    { key: 'company_phone', value: '', group: 'contact', label: 'Phone' },
    { key: 'company_email', value: '', group: 'contact', label: 'Email' },
    { key: 'site_title', value: 'Venus Essentials - Premium Wellness from Ooty', group: 'seo', label: 'Site Title' },
    { key: 'site_description', value: 'Premium coffee, tea, essential oils and chocolates from the hills of Ooty. 40+ years of heritage wellness.', group: 'seo', label: 'Site Description' },
  ];

  for (const setting of settings) {
    await Settings.findOneAndUpdate({ key: setting.key }, setting, { upsert: true });
  }
  console.log('✅ Settings seeded');

  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
