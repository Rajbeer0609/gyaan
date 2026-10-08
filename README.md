# GYAAN — Luxury & Modern Clothing E-Commerce Platform

GYAAN is a full-stack, modular, and scalable fashion e-commerce platform built with React, Node.js, Express, MongoDB, and Razorpay. Designed with a dark modern luxury editorial aesthetic in Indian Rupees (₹).

---

## Architecture Overview

- **Frontend**: React (Vite), React Router v6, Context API (Auth, Cart, Wishlist, UI), Vanilla CSS Design System with Luxury Dark Theme Tokens.
- **Backend**: Node.js, Express.js, MVC architecture with layered services, controllers, routes, and middleware.
- **Database**: MongoDB with Mongoose ODM (variant-aware inventory, relational indexing).
- **Authentication**: JWT authentication with bcrypt password hashing and Role-Based Access Control (Admin / Customer).
- **Payments**: Razorpay server-side order generation and cryptographic HMAC-SHA256 signature verification.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017` or MongoDB Atlas URI
- Git

### Installation & Quick Start

1. **Clone repository**:
   ```bash
   git clone https://github.com/Rajbeer0609/gyaan.git
   cd gyaan
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   cp ../.env.example .env
   # Start MongoDB or provide your MongoDB Atlas connection string in server/.env
   npm run seed   # Seeds categories, products, admin user
   npm run dev    # Starts backend API on http://localhost:5000
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev    # Starts Vite dev server on http://localhost:5173
   ```

---

## Admin Credentials (Development Seed)

- **Email**: `admin@gyaan.com`
- **Password**: `Admin@Gyaan2026`
- **Dashboard URL**: `/admin`
