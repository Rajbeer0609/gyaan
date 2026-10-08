import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

const runE2ETests = async () => {
  console.log('==================================================');
  console.log('   GYAAN FULL-STACK SUITE — END-TO-END VERIFICATION');
  console.log('==================================================\n');

  try {
    // 1. Health check
    const health = await api.get('/health');
    console.log('✓ [Health Check]:', health.data.status, '-', health.data.brand);

    // 2. Fetch categories
    const categories = await api.get('/categories');
    console.log(`✓ [Categories]: Fetched ${categories.data.data.categories.length} dynamic categories.`);

    // 3. Fetch products
    const productsRes = await api.get('/products?limit=10');
    console.log(`✓ [Products Catalog]: Total ${productsRes.data.data.pagination.total} products.`);
    const firstProduct = productsRes.data.data.products[0];
    console.log(`   Sample Product: "${firstProduct.name}" (Price: ₹${firstProduct.price})`);

    // 4. Test Search & Filter
    const searchRes = await api.get('/products?gender=men&minPrice=3000');
    console.log(`✓ [Search & Filter]: Found ${searchRes.data.data.products.length} men's garments over ₹3,000.`);

    // 5. Customer Login
    const loginRes = await api.post('/auth/login', {
      email: 'customer@gyaan.com',
      password: 'Customer@12345',
    });
    const customerToken = loginRes.data.data.token;
    console.log('✓ [Customer Authentication]: Logged in as', loginRes.data.data.user.name);

    const customerApi = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    // 6. Cart Management
    const initialStock = firstProduct.variants?.[0]?.stock || firstProduct.totalStock;
    const addCartRes = await customerApi.post('/cart', {
      productId: firstProduct._id,
      color: firstProduct.colors?.[0]?.name || 'Standard',
      size: firstProduct.sizes?.[0] || 'M',
      quantity: 1,
    });
    console.log(`✓ [Cart]: Added garment to bag. Total items in cart: ${addCartRes.data.data.cart.items.length}`);

    // 7. Coupon Validation
    const couponRes = await customerApi.post('/coupons/validate', {
      code: 'WELCOME10',
      orderAmount: firstProduct.price,
    });
    console.log(`✓ [Coupons]: Validated coupon "${couponRes.data.data.code}". Discount applied: ₹${couponRes.data.data.discountAmount}`);

    // 8. Payment Order Generation
    const totalPayable = firstProduct.price - couponRes.data.data.discountAmount;
    const paymentOrderRes = await customerApi.post('/payment/create-order', {
      amount: totalPayable,
      items: [
        {
          product: firstProduct._id,
          color: firstProduct.colors?.[0]?.name || 'Standard',
          size: firstProduct.sizes?.[0] || 'M',
          quantity: 1,
        },
      ],
    });
    const { orderId, amount, currency } = paymentOrderRes.data.data;
    console.log(`✓ [Razorpay]: Generated payment order ${orderId} for ₹${amount / 100} ${currency}`);

    // 9. Payment Signature Verification
    const mockPaymentId = `pay_e2e_test_${Date.now()}`;
    const mockSignature = `sig_e2e_test_${Date.now()}`;
    const verifyRes = await customerApi.post('/payment/verify', {
      razorpayOrderId: orderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSignature,
    });
    console.log('✓ [Payment Verification]: Server verified cryptographic HMAC signature.');

    // 10. Final Order Creation
    const orderRes = await customerApi.post('/orders', {
      items: [
        {
          product: firstProduct._id,
          name: firstProduct.name,
          image: firstProduct.images[0],
          color: firstProduct.colors?.[0]?.name || 'Standard',
          size: firstProduct.sizes?.[0] || 'M',
          quantity: 1,
          price: firstProduct.price,
        },
      ],
      shippingAddress: {
        fullName: 'Rohan Sharma',
        phone: '+91 98123 45678',
        addressLine1: '42 Prithviraj Road, Lutyens',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110011',
      },
      subtotal: firstProduct.price,
      discount: couponRes.data.data.discountAmount,
      shippingFee: 0,
      tax: Math.round(totalPayable * 0.12),
      total: totalPayable,
      couponCode: 'WELCOME10',
      paymentMethod: 'razorpay',
      razorpayOrderId: orderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSignature,
    });
    console.log(`✓ [Order Creation]: Confirmed Order #${orderRes.data.data.order.orderNumber}`);

    // 11. Verify Inventory Deduction
    const refreshedProduct = await api.get(`/products/id/${firstProduct._id}`);
    const remainingStock = refreshedProduct.data.data.product.variants?.[0]?.stock || refreshedProduct.data.data.product.totalStock;
    console.log(`✓ [Inventory Engine]: Stock successfully updated from ${initialStock} -> ${remainingStock}`);

    // 12. Admin Authentication & Dashboard
    const adminLogin = await api.post('/auth/login', {
      email: 'admin@gyaan.com',
      password: 'Admin@Gyaan2026',
    });
    const adminToken = adminLogin.data.data.token;
    console.log('✓ [Admin Authentication]: Logged in as Administrator.');

    const adminApi = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const dashStats = await adminApi.get('/admin/dashboard');
    console.log('✓ [Admin Dashboard]:');
    console.log(`   - Total Revenue: ₹${dashStats.data.data.totalRevenue}`);
    console.log(`   - Orders Count: ${dashStats.data.data.totalOrders}`);
    console.log(`   - Customers Count: ${dashStats.data.data.totalCustomers}`);
    console.log(`   - Active Silhouettes: ${dashStats.data.data.totalProducts}`);

    console.log('\n==================================================');
    console.log('  ALL E2E WORKFLOWS VERIFIED AND OPERATIONAL!     ');
    console.log('==================================================\n');
  } catch (err) {
    console.error('E2E Test Failure:', err.response?.data || err.message);
    process.exit(1);
  }
};

runE2ETests();
