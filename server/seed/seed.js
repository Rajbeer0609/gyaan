import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { initialCategories, initialCoupons, sampleProducts } from './seedData.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const { default: mongoose } = await import('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Initiating database connection...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    // 1. Create Default Admin & Test Customer
    console.log('[Seed] Creating administrative and customer accounts...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gyaan.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Gyaan2026';

    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'GYAAN Executive Admin',
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const customer = await User.create({
      name: 'Rohan Sharma',
      email: 'customer@gyaan.com',
      password: 'Customer@12345',
      role: 'customer',
      phone: '+91 98123 45678',
    });

    console.log(`[Seed] Admin created: ${admin.email}`);
    console.log(`[Seed] Demo Customer created: ${customer.email}`);

    // 2. Insert Categories
    console.log('[Seed] Inserting product categories...');
    const categoryDocs = await Category.insertMany(initialCategories);
    const categoryMap = {};
    categoryDocs.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // 3. Insert Coupons
    console.log('[Seed] Inserting promotional coupons...');
    await Coupon.insertMany(initialCoupons);

    // 4. Construct and insert Products with variant inventory
    console.log('[Seed] Building products with variant-level inventory...');
    const productsToInsert = sampleProducts.map(p => {
      const categoryId = categoryMap[p.categorySlug] || categoryDocs[0]._id;

      // Construct realistic variant inventory across sizes and colors
      const variants = [];
      p.colors.forEach(col => {
        p.sizes.forEach(sz => {
          // Stock between 4 and 25 per variant
          const stock = Math.floor(Math.random() * 20) + 5;
          variants.push({
            color: col.name,
            colorCode: col.hex,
            size: sz,
            sku: `GYA-${p.slug.slice(0, 4).toUpperCase()}-${col.name.slice(0, 3).toUpperCase()}-${sz}`,
            stock,
            price: p.price,
            image: p.images[0],
          });
        });
      });

      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const discountPercentage = p.compareAtPrice > p.price
        ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
        : 0;

      return {
        ...p,
        category: categoryId,
        variants,
        totalStock,
        discountPercentage,
        isOnSale: discountPercentage > 0,
        sku: `GYA-${p.slug.slice(0, 6).toUpperCase()}`,
      };
    });

    const productDocs = await Product.insertMany(productsToInsert);
    console.log(`[Seed] Successfully seeded ${productDocs.length} luxury products.`);

    console.log('\n=========================================');
    console.log(' GYAAN SEEDING COMPLETED SUCCESSFULLY!  ');
    console.log(' Admin:    ' + adminEmail);
    console.log(' Password: ' + adminPassword);
    console.log(' Customer: customer@gyaan.com / Customer@12345');
    console.log('=========================================\n');

    return { admin, customer, productCount: productDocs.length };
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    throw err;
  }
};

// If run directly via `node seed/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => closeDB().then(() => process.exit(0)))
    .catch(() => closeDB().then(() => process.exit(1)));
}
