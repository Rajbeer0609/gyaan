import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    brand: 'GYAAN Luxury Clothing',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on GYAAN API: ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Start server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    
    // Auto-seed if database is currently empty
    const { Product } = await import('./models/Product.js');
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[GYAAN Engine] Database is empty. Auto-populating initial luxury catalog...');
      const { seedDatabase } = await import('./seed/seed.js');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`[GYAAN Engine] Server operational on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    console.error('[GYAAN Engine] Fatal error during startup:', err);
    process.exit(1);
  }
};

startServer();

export default app;
