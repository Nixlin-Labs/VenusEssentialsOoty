require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Category, Product, ProductVariant } = require('../models');

const productsData = {
  'coffee-powders': [
    {
      name: 'Premium Filter Coffee',
      description: 'Authentic South Indian filter coffee blend with chicory, sourced directly from the finest estates in the Nilgiris.',
      shortDescription: 'Classic 80:20 Coffee-Chicory Blend',
      isBestSeller: true,
      variants: [
        { name: '250g', sku: 'COF-FIL-250', price: 250, offerPrice: 220, weight: { value: 250, unit: 'g' }, stock: 50, isDefault: true },
        { name: '500g', sku: 'COF-FIL-500', price: 480, offerPrice: 420, weight: { value: 500, unit: 'g' }, stock: 30, isDefault: false }
      ]
    },
    {
      name: 'Pure Arabica Beans',
      description: '100% pure Arabica coffee beans, medium roasted to perfection for a smooth and aromatic cup.',
      shortDescription: '100% Pure Medium Roast Arabica',
      isNewArrival: true,
      variants: [
        { name: '250g', sku: 'COF-ARA-250', price: 350, offerPrice: 315, weight: { value: 250, unit: 'g' }, stock: 40, isDefault: true },
        { name: '500g', sku: 'COF-ARA-500', price: 680, offerPrice: null, weight: { value: 500, unit: 'g' }, stock: 20, isDefault: false }
      ]
    },
    {
      name: 'Instant Strong Coffee',
      description: 'Premium instant coffee crystals made from handpicked robusta and arabica beans.',
      shortDescription: 'Strong Instant Coffee Crystals',
      isFeatured: true,
      variants: [
        { name: '100g', sku: 'COF-INS-100', price: 180, offerPrice: null, weight: { value: 100, unit: 'g' }, stock: 100, isDefault: true },
        { name: '200g', sku: 'COF-INS-200', price: 340, offerPrice: 300, weight: { value: 200, unit: 'g' }, stock: 60, isDefault: false }
      ]
    }
  ],
  'tea-powder': [
    {
      name: 'Nilgiri Black Tea',
      description: 'Classic high-grown Nilgiri black tea leaves, known for their briskness, fragrance, and vibrant color.',
      shortDescription: 'Premium High-Grown Black Tea',
      isBestSeller: true,
      variants: [
        { name: '250g', sku: 'TEA-BLK-250', price: 200, offerPrice: 180, weight: { value: 250, unit: 'g' }, stock: 150, isDefault: true },
        { name: '500g', sku: 'TEA-BLK-500', price: 380, offerPrice: 340, weight: { value: 500, unit: 'g' }, stock: 80, isDefault: false }
      ]
    },
    {
      name: 'Organic Green Tea',
      description: 'Unfermented green tea leaves from organic gardens, rich in antioxidants and delicate in flavor.',
      shortDescription: 'Antioxidant-Rich Organic Green Tea',
      isFeatured: true,
      variants: [
        { name: '100g', sku: 'TEA-GRN-100', price: 150, offerPrice: null, weight: { value: 100, unit: 'g' }, stock: 60, isDefault: true },
        { name: '250g', sku: 'TEA-GRN-250', price: 350, offerPrice: 310, weight: { value: 250, unit: 'g' }, stock: 40, isDefault: false }
      ]
    },
    {
      name: 'Masala Chai Blend',
      description: 'A comforting blend of robust black tea mixed with traditional Indian spices like cardamom, cinnamon, and cloves.',
      shortDescription: 'Spiced Black Tea Blend',
      isNewArrival: true,
      variants: [
        { name: '250g', sku: 'TEA-MAS-250', price: 280, offerPrice: 250, weight: { value: 250, unit: 'g' }, stock: 75, isDefault: true }
      ]
    }
  ],
  'essential-oils': [
    {
      name: 'Pure Eucalyptus Oil',
      description: '100% pure, therapeutic-grade eucalyptus oil distilled from Nilgiri blue gum trees. Excellent for respiratory wellness and muscle relief.',
      shortDescription: '100% Pure Nilgiri Eucalyptus',
      isBestSeller: true,
      isFeatured: true,
      variants: [
        { name: '50ml', sku: 'OIL-EUC-050', price: 250, offerPrice: null, weight: { value: 50, unit: 'ml' }, stock: 120, isDefault: true },
        { name: '100ml', sku: 'OIL-EUC-100', price: 450, offerPrice: 400, weight: { value: 100, unit: 'ml' }, stock: 85, isDefault: false }
      ]
    },
    {
      name: 'Lavender Essential Oil',
      description: 'Calming lavender essential oil, perfect for aromatherapy, relaxation, and promoting restful sleep.',
      shortDescription: 'Calming Aromatherapy Oil',
      variants: [
        { name: '15ml', sku: 'OIL-LAV-015', price: 350, offerPrice: 315, weight: { value: 15, unit: 'ml' }, stock: 40, isDefault: true },
        { name: '30ml', sku: 'OIL-LAV-030', price: 650, offerPrice: 590, weight: { value: 30, unit: 'ml' }, stock: 25, isDefault: false }
      ]
    },
    {
      name: 'Lemongrass Oil',
      description: 'Invigorating lemongrass oil, great for natural cleaning, repelling insects, and uplifting the mood.',
      shortDescription: 'Invigorating Citrus Essential Oil',
      isNewArrival: true,
      variants: [
        { name: '50ml', sku: 'OIL-LEM-050', price: 220, offerPrice: 199, weight: { value: 50, unit: 'ml' }, stock: 65, isDefault: true }
      ]
    }
  ],
  'chocolates': [
    {
      name: 'Assorted Homemade Chocolates',
      description: 'A delightful mix of handmade Ooty chocolates including fruit & nut, butterscotch, and plain milk chocolate.',
      shortDescription: 'Mix of Popular Handmade Chocolates',
      isBestSeller: true,
      variants: [
        { name: '250g', sku: 'CHO-ASS-250', price: 350, offerPrice: null, weight: { value: 250, unit: 'g' }, stock: 45, isDefault: true },
        { name: '500g', sku: 'CHO-ASS-500', price: 650, offerPrice: 600, weight: { value: 500, unit: 'g' }, stock: 30, isDefault: false }
      ]
    },
    {
      name: '70% Dark Chocolate Truffles',
      description: 'Rich, decadent 70% dark chocolate truffles made from premium cocoa.',
      shortDescription: 'Rich Dark Chocolate Truffles',
      isFeatured: true,
      variants: [
        { name: '200g', sku: 'CHO-DRK-200', price: 420, offerPrice: 380, weight: { value: 200, unit: 'g' }, stock: 25, isDefault: true }
      ]
    },
    {
      name: 'Roasted Almond Chocolates',
      description: 'Crunchy roasted almonds smothered in creamy milk chocolate.',
      shortDescription: 'Milk Chocolate with Roasted Almonds',
      variants: [
        { name: '250g', sku: 'CHO-ALM-250', price: 400, offerPrice: 360, weight: { value: 250, unit: 'g' }, stock: 50, isDefault: true }
      ]
    }
  ],
  'wellness-products': [
    {
      name: 'Handmade Sandalwood Soap',
      description: 'Luxurious handmade soap infused with pure sandalwood oil for glowing, nourished skin.',
      shortDescription: 'Pure Sandalwood Infused Soap',
      isBestSeller: true,
      variants: [
        { name: '100g (Pack of 3)', sku: 'WEL-SND-100x3', price: 300, offerPrice: 270, weight: { value: 3, unit: 'pcs' }, stock: 60, isDefault: true }
      ]
    },
    {
      name: 'Herbal Massage Oil',
      description: 'A deeply relaxing blend of traditional herbs and oils formulated to relieve muscle tension and joint pain.',
      shortDescription: 'Pain Relief Herbal Massage Oil',
      isFeatured: true,
      variants: [
        { name: '100ml', sku: 'WEL-MAS-100', price: 350, offerPrice: null, weight: { value: 100, unit: 'ml' }, stock: 35, isDefault: true },
        { name: '200ml', sku: 'WEL-MAS-200', price: 650, offerPrice: 580, weight: { value: 200, unit: 'ml' }, stock: 20, isDefault: false }
      ]
    },
    {
      name: 'Aloe Vera & Neem Face Wash',
      description: 'Gentle, natural face wash that combines the soothing properties of aloe vera with the purifying benefits of neem.',
      shortDescription: 'Natural Purifying Face Wash',
      isNewArrival: true,
      variants: [
        { name: '150ml', sku: 'WEL-ALN-150', price: 250, offerPrice: 225, weight: { value: 150, unit: 'ml' }, stock: 80, isDefault: true }
      ]
    }
  ]
};

const seedProducts = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting Product Seed...');

    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('❌ No categories found. Please run the main seeder first.');
      process.exit(1);
    }

    // Clean existing products and variants
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    console.log('🗑️ Cleared existing products and variants.');

    for (const category of categories) {
      const catSlug = category.slug;
      const productsToSeed = productsData[catSlug];
      
      if (!productsToSeed) {
        console.log(`⚠️ No seed data for category: ${catSlug}`);
        continue;
      }

      for (let i = 0; i < productsToSeed.length; i++) {
        const prodData = productsToSeed[i];
        
        // Create Product
        const newProduct = await Product.create({
          name: prodData.name,
          slug: `${prodData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
          description: prodData.description,
          shortDescription: prodData.shortDescription,
          category: category._id,
          isFeatured: prodData.isFeatured || false,
          isBestSeller: prodData.isBestSeller || false,
          isNewArrival: prodData.isNewArrival || false,
          gstPercentage: 18,
          status: 'active',
          images: [
            // Dummy image for seeding
            { url: `/uploads/categories/${catSlug}.webp`, alt: prodData.name, isPrimary: true }
          ]
        });

        // Create Variants
        const variants = prodData.variants;
        for (let j = 0; j < variants.length; j++) {
          const varData = variants[j];
          await ProductVariant.create({
            product: newProduct._id,
            name: varData.name,
            sku: varData.sku,
            price: varData.price,
            offerPrice: varData.offerPrice,
            weight: varData.weight,
            stock: varData.stock,
            isDefault: varData.isDefault,
            isActive: true
          });
        }
        console.log(`✅ Seeded Product: ${prodData.name}`);
      }
      
      // Update product count in category
      const count = await Product.countDocuments({ category: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }

    console.log('\n🎉 Product seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedProducts();
