import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User, Product, Category, Coupon, Order, Cart } from '../src/models';
import { PaymentService } from '../src/services/paymentService';
import { InventoryService } from '../src/services/inventoryService';

const app = createApp();

let adminToken: string;
let customerToken: string;
let testProduct: any;
let testCategory: any;
let testCoupon: any;

describe('NEXORA E-Commerce API Integration Tests', () => {
  beforeAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: /test.*@nexora\.com/ });
    await Product.deleteMany({ sku: /TEST-.*/ });
    await Category.deleteMany({ slug: 'test-gear' });
    await Coupon.deleteMany({ code: 'TEST50' });

    // Setup Category
    testCategory = await Category.create({
      name: 'Test Gear',
      slug: 'test-gear',
      description: 'Category for automated tests'
    });

    // Setup Product
    testProduct = await Product.create({
      title: 'Quantum Test Headset',
      slug: 'quantum-test-headset',
      description: 'Audio gear engineered for unit and integration testing',
      price: 5000,
      stock: 10,
      lowStockThreshold: 3,
      category: testCategory._id,
      images: ['https://example.com/test-headset.jpg'],
      sku: 'TEST-QTH-01',
      tags: ['audio', 'quantum', 'test']
    });

    // Setup Coupon
    testCoupon = await Coupon.create({
      code: 'TEST50',
      description: '50% off for test suite',
      discountType: 'percentage',
      discountValue: 50,
      minOrderValue: 2000,
      maxDiscount: 3000,
      expiryDate: new Date(Date.now() + 86400000),
      usageLimit: 100,
      isActive: true
    });
  });

  // 1. User Registration
  describe('Auth: Registration & Login', () => {
    it('1. should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Customer',
          email: 'testcustomer@nexora.com',
          password: 'Password@123',
          phone: '+91 9123456789'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('testcustomer@nexora.com');
      expect(res.body.data.accessToken).toBeDefined();

      customerToken = res.body.data.accessToken;
    });

    it('2. should reject registration with already registered email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'testcustomer@nexora.com',
          password: 'Password@123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('3. should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testcustomer@nexora.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('4. should login admin user and obtain admin token', async () => {
      // Create admin user
      await User.deleteOne({ email: 'testadmin@nexora.com' });
      await User.create({
        name: 'Test Admin',
        email: 'testadmin@nexora.com',
        password: 'AdminPassword@123',
        role: 'admin'
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'testadmin@nexora.com',
          password: 'AdminPassword@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      adminToken = res.body.data.accessToken;
    });
  });

  // 2. Role-Based Access Control
  describe('RBAC: Authorization Checks', () => {
    it('5. should deny customer access to admin-only analytics routes (HTTP 403)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('6. should allow admin access to analytics routes (HTTP 200)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProducts).toBeDefined();
    });
  });

  // 3. Product CRUD & Search
  describe('Products: Catalog & Search', () => {
    it('7. should list products with pagination and category filtering', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ category: testCategory.slug, page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('8. should search products by keyword', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .query({ search: 'Quantum' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((p: any) => p.title.includes('Quantum'))).toBe(true);
    });

    it('9. should allow admin to create a new product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Cyber Test Keyboard',
          description: 'Custom mechanical keyboard for testing',
          price: 8500,
          stock: 15,
          category: testCategory._id.toString(),
          images: ['https://example.com/keyboard.jpg'],
          sku: 'TEST-KB-99'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('TEST-KB-99');
    });
  });

  // 4. Cart Management & Calculations
  describe('Cart: Calculations & Coupons', () => {
    it('10. should add items to cart and calculate correct subtotal', async () => {
      const res = await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.subtotal).toBe(10000); // 5000 * 2
      expect(res.body.data.finalTotal).toBe(10000);
    });

    it('11. should apply coupon code and accurately discount total', async () => {
      const res = await request(app)
        .post('/api/v1/cart/coupon')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'TEST50' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appliedCoupon.code).toBe('TEST50');
      // Subtotal 10000 * 50% = 5000, capped at maxDiscount 3000
      expect(res.body.data.discountTotal).toBe(3000);
      expect(res.body.data.finalTotal).toBe(7000);
    });

    it('12. should reject invalid or expired coupons', async () => {
      const res = await request(app)
        .post('/api/v1/cart/coupon')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ code: 'NONEXISTENT_CODE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 5. Checkout & Inventory Deduction
  describe('Checkout & Inventory Safety', () => {
    it('13. should create an order from cart and atomically deduct stock', async () => {
      const initialStock = (await Product.findById(testProduct._id))!.stock;

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          shippingAddress: {
            fullName: 'Test Customer',
            phone: '+91 9123456789',
            street: '123 Matrix Way',
            city: 'Neo City',
            state: 'Cyber',
            postalCode: '560001',
            country: 'India'
          },
          paymentMethod: 'cod'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Confirmed'); // COD confirmed
      expect(res.body.data.orderNumber).toBeDefined();

      // Check stock deducted atomically
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct!.stock).toBe(initialStock - 2);

      // Verify cart emptied
      const cartRes = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(cartRes.body.data.items.length).toBe(0);
    });

    it('14. should prevent overselling when requested quantity exceeds available stock', async () => {
      // Create limited stock item: only 2 available
      const limitedProduct = await Product.create({
        title: 'Rare Cyber Crystal',
        slug: 'rare-cyber-crystal-test',
        description: 'Super limited stock',
        price: 9999,
        stock: 2,
        category: testCategory._id,
        sku: 'TEST-RARE-01'
      });

      // Add 2 to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: limitedProduct._id.toString(), quantity: 2 });

      // Directly try to deduct 5 via InventoryService
      await expect(
        InventoryService.atomicDeductStock(
          [{ productId: limitedProduct._id.toString(), quantity: 5 }],
          'TEST-REF-OVERSELL'
        )
      ).rejects.toThrow(/Insufficient stock/);

      // Verify stock did not turn negative
      const unchanged = await Product.findById(limitedProduct._id);
      expect(unchanged!.stock).toBe(2);
    });

    it('15. should prevent duplicate orders using Idempotency Key', async () => {
      // Add item to cart
      await request(app)
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProduct._id.toString(), quantity: 1 });

      const idempotencyKey = `idemp_test_${Date.now()}`;
      const payload = {
        shippingAddress: {
          fullName: 'Idempotent Buyer',
          phone: '+91 9123456789',
          street: '100 Blockchain Ave',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560100',
          country: 'India'
        },
        paymentMethod: 'cod'
      };

      // First call
      const res1 = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Idempotency-Key', idempotencyKey)
        .send(payload);

      expect(res1.status).toBe(201);
      const orderNumber1 = res1.body.data.orderNumber;

      // Second identical call with the same idempotency key
      const res2 = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .set('X-Idempotency-Key', idempotencyKey)
        .send(payload);

      // Should return exact same cached order without double deducting stock!
      expect(res2.body.data.orderNumber).toBe(orderNumber1);
    });
  });

  // 6. Payment Signature Verification
  describe('Payments: Sandbox Verification', () => {
    it('16. should verify sandbox payment and transition order to Confirmed', async () => {
      // Create a pending order
      const order = await Order.create({
        orderNumber: `NEX-TEST-PAY-${Date.now()}`,
        user: (await User.findOne({ email: 'testcustomer@nexora.com' }))!._id,
        items: [
          {
            product: testProduct._id,
            title: testProduct.title,
            price: 5000,
            quantity: 1,
            subtotal: 5000
          }
        ],
        shippingAddress: {
          fullName: 'Test Payee',
          phone: '+91 9999999999',
          street: 'Pay St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        },
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        status: 'Pending',
        subtotal: 5000,
        total: 5900
      });

      const txnId = `txn_test_${Date.now()}`;
      const gatewayOrderId = `order_test_${Date.now()}`;
      const validSig = PaymentService.generateSandboxSignature(gatewayOrderId, txnId);

      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: order._id.toString(),
          transactionId: txnId,
          gatewayOrderId,
          signature: validSig
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('Confirmed');
      expect(res.body.data.order.paymentStatus).toBe('completed');
    });
  });

  // 7. Order Status Transitions State Machine
  describe('Order Lifecycle: State Machine Enforcement', () => {
    it('17. should allow valid transition from Confirmed -> Processing -> Shipped', async () => {
      const order = await Order.create({
        orderNumber: `NEX-STATE-${Date.now()}`,
        user: (await User.findOne({ email: 'testcustomer@nexora.com' }))!._id,
        items: [],
        shippingAddress: {
          fullName: 'State Test',
          phone: '9999999999',
          street: 'State St',
          city: 'Pune',
          state: 'MH',
          postalCode: '411001',
          country: 'India'
        },
        paymentMethod: 'cod',
        paymentStatus: 'completed',
        status: 'Confirmed',
        subtotal: 1000,
        total: 1180
      });

      // Confirmed -> Processing
      const res1 = await request(app)
        .patch(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Processing' });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('Processing');

      // Processing -> Shipped
      const res2 = await request(app)
        .patch(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Shipped', trackingNumber: 'TRK-99001' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('Shipped');
    });

    it('18. should reject invalid state transition (e.g. Confivered directly to Delivered)', async () => {
      const order = await Order.create({
        orderNumber: `NEX-INVALID-${Date.now()}`,
        user: (await User.findOne({ email: 'testcustomer@nexora.com' }))!._id,
        items: [],
        shippingAddress: {
          fullName: 'Invalid State Test',
          phone: '9999999999',
          street: 'Invalid St',
          city: 'Pune',
          state: 'MH',
          postalCode: '411001',
          country: 'India'
        },
        paymentMethod: 'cod',
        status: 'Confirmed',
        subtotal: 1000,
        total: 1180
      });

      // Confirmed -> Delivered is INVALID without Processing and Shipped
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Delivered' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid status transition/);
    });
  });
});
