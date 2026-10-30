import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db';
import { User, Product, Category, Coupon, Order, Payment, InventoryLog } from '../src/models';
import { ENV } from '../src/config/env';
import { logger } from '../src/utils/logger';

const seedDatabase = async () => {
  try {
    logger.info('Starting NEXORA database seeding...');
    await connectDB();

    // Clear existing data (for clean fresh seed)
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      InventoryLog.deleteMany({})
    ]);

    logger.info('Existing collections cleared.');

    // 1. Create Admin & Customer Users
    const adminUser = await User.create({
      name: 'Nexora Systems Admin',
      email: ENV.ADMIN_EMAIL.toLowerCase(),
      password: ENV.ADMIN_PASSWORD,
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      addresses: [
        {
          fullName: 'Nexora Admin Ops',
          phone: '+91 98765 43210',
          street: '404 Cyber Tower, Outer Ring Rd',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560103',
          country: 'India',
          isDefault: true
        }
      ]
    });

    const demoCustomer = await User.create({
      name: 'Aiden Vance',
      email: 'customer@nexora.com',
      password: 'Customer@12345',
      role: 'customer',
      phone: '+91 99887 76655',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      addresses: [
        {
          fullName: 'Aiden Vance',
          phone: '+91 99887 76655',
          street: '12 Neo Boulevard, Cybercity Phase 2',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500081',
          country: 'India',
          isDefault: true
        }
      ]
    });

    logger.success(`Created users: Admin (${adminUser.email}) and Customer (${demoCustomer.email})`);

    // 2. Create Categories
    const categoriesData = [
      {
        name: 'Neural Audio',
        slug: 'neural-audio',
        description: 'Immersive planar magnetic headphones, spatial audio monitors, and neural earbuds.',
        icon: 'Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        featured: true
      },
      {
        name: 'Quantum Wearables',
        slug: 'quantum-wearables',
        description: 'Bio-sensing titanium smartwatches, cyber fitness trackers, and optical HUD lenses.',
        icon: 'Watch',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        featured: true
      },
      {
        name: 'Cyber Peripherals',
        slug: 'cyber-peripherals',
        description: 'CNC aluminum mechanical keyboards, ultra-light precision gaming mice, and desks.',
        icon: 'Keyboard',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
        featured: true
      },
      {
        name: 'AI Workstation',
        slug: 'ai-workstation',
        description: 'Neural accelerators, curved OLED displays, and liquid-cooled workstation accessories.',
        icon: 'Cpu',
        image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600',
        featured: true
      },
      {
        name: 'Kinetic Power',
        slug: 'kinetic-power',
        description: 'GaN fast charging hubs, magnetic cyber power banks, and wireless desk pads.',
        icon: 'Zap',
        image: 'https://images.unsplash.com/photo-1609592807664-2821b0dc3863?w=600',
        featured: false
      }
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = new Map(categories.map((c) => [c.slug, c._id]));
    logger.success(`Created ${categories.length} categories.`);

    // 3. Create Products
    const productsData = [
      {
        title: 'Nexora Pulse-X ANC Wireless Headset',
        slug: 'nexora-pulse-x-anc-headset',
        description: 'Engineered with 40mm planar magnetic drivers, active hybrid noise cancellation up to 48dB, and spatial head-tracking. 55-hour battery life with ultra-low latency 2.4GHz dongle.',
        price: 14999,
        compareAtPrice: 19999,
        costPrice: 9000,
        stock: 35,
        lowStockThreshold: 8,
        category: catMap.get('neural-audio'),
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800'
        ],
        rating: 4.9,
        numReviews: 128,
        tags: ['Audio', 'Headphones', 'ANC', 'Wireless', 'Spatial'],
        brand: 'NEXORA LABS',
        sku: 'NEX-PULSE-X',
        isFeatured: true,
        attributes: {
          Driver: '40mm Planar Magnetic',
          Battery: '55 Hours',
          Connectivity: 'Bluetooth 5.4 + 2.4GHz Wireless',
          Weight: '240g'
        }
      },
      {
        title: 'CyberSync Pro Chrono Smartwatch',
        slug: 'cybersync-pro-chrono-smartwatch',
        description: 'Grade 5 titanium chassis, sapphire crystal display, continuous bio-metric telemetry, blood oxygen tracking, and 14-day endurance. Waterproof to 100 meters.',
        price: 24999,
        compareAtPrice: 29999,
        costPrice: 16000,
        stock: 18,
        lowStockThreshold: 5,
        category: catMap.get('quantum-wearables'),
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800'
        ],
        rating: 4.8,
        numReviews: 86,
        tags: ['Smartwatch', 'Titanium', 'Health', 'Wearable'],
        brand: 'NEXORA LABS',
        sku: 'NEX-CHRONO-PRO',
        isFeatured: true,
        attributes: {
          Chassis: 'Titanium Grade 5',
          Display: '1.43 inch AMOLED 1000 nits',
          Sensors: 'ECG, PPG, SpO2, Barometer',
          Endurance: '14 Days'
        }
      },
      {
        title: 'Aura-80 Gasket Custom Keyboard',
        slug: 'aura-80-gasket-custom-keyboard',
        description: 'CNC machined anodized aluminum body, hot-swappable tactile switches, silicone sound dampening, per-key RGB backlighting, and programmable QMK/VIA rotary dial.',
        price: 12499,
        compareAtPrice: 15999,
        costPrice: 7500,
        stock: 4, // Low stock product!
        lowStockThreshold: 5,
        category: catMap.get('cyber-peripherals'),
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
          'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'
        ],
        rating: 4.95,
        numReviews: 64,
        tags: ['Keyboard', 'Mechanical', 'Gasket', 'RGB', 'Custom'],
        brand: 'NEXORA STUDIO',
        sku: 'NEX-AURA-80',
        isFeatured: true,
        attributes: {
          Layout: '75% Compact',
          Mounting: 'Gasket Mount',
          Switches: 'Pre-lubed Holy Panda Tactile',
          Connectivity: 'Type-C, 2.4GHz, BT 5.2'
        }
      },
      {
        title: 'AeroZero Wireless Gaming Mouse 42g',
        slug: 'aerozero-wireless-gaming-mouse',
        description: 'Ultra-lightweight magnesium alloy exoskeleton weighing only 42 grams. PixArt 3395 sensor with 26,000 DPI and 4000Hz polling rate for esports domination.',
        price: 7999,
        compareAtPrice: 9999,
        costPrice: 4800,
        stock: 22,
        lowStockThreshold: 6,
        category: catMap.get('cyber-peripherals'),
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
          'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=800'
        ],
        rating: 4.7,
        numReviews: 43,
        tags: ['Mouse', 'Esports', 'Ultralight', 'Gaming'],
        brand: 'NEXORA STUDIO',
        sku: 'NEX-AERO-ZERO',
        isFeatured: false,
        attributes: {
          Weight: '42 grams',
          Sensor: 'PixArt 3395 (26K DPI)',
          PollingRate: '4000Hz Native',
          Battery: '80 Hours'
        }
      },
      {
        title: 'Visionary 34 Curved OLED Monitor',
        slug: 'visionary-34-curved-oled-monitor',
        description: '34-inch QD-OLED ultrawide panel (3440x1440), 175Hz refresh rate, 0.03ms response time, 99.3% DCI-P3 color gamut, and integrated KVM switch.',
        price: 69999,
        compareAtPrice: 84999,
        costPrice: 48000,
        stock: 2, // Low stock product!
        lowStockThreshold: 5,
        category: catMap.get('ai-workstation'),
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
          'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800'
        ],
        rating: 5.0,
        numReviews: 31,
        tags: ['Monitor', 'OLED', 'Ultrawide', 'Display', '175Hz'],
        brand: 'NEXORA LABS',
        sku: 'NEX-VISION-34',
        isFeatured: true,
        attributes: {
          Panel: 'Quantum Dot OLED',
          Resolution: '3440 x 1440 UWQHD',
          RefreshRate: '175Hz',
          Contrast: '1,000,000:1'
        }
      },
      {
        title: 'TensorFlow Neural Mini Co-Processor',
        slug: 'tensorflow-neural-mini-coprocessor',
        description: 'Edge-AI computing module with 32 TOPS tensor processing power. USB-C plug-and-play for real-time model inference, computer vision, and local LLM acceleration.',
        price: 18999,
        compareAtPrice: 22999,
        costPrice: 12000,
        stock: 15,
        lowStockThreshold: 4,
        category: catMap.get('ai-workstation'),
        images: [
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
        ],
        rating: 4.85,
        numReviews: 19,
        tags: ['AI', 'Hardware', 'Accelerator', 'Edge', 'Tensor'],
        brand: 'NEXORA AI',
        sku: 'NEX-TENSOR-MINI',
        isFeatured: true,
        attributes: {
          Compute: '32 INT8 TOPS',
          Interface: 'USB 4.0 Type-C',
          Power: '15W TDP',
          Compatibility: 'PyTorch, ONNX, TF'
        }
      },
      {
        title: 'VoltGrid 140W GaN Charging Station',
        slug: 'voltgrid-140w-gan-charging-station',
        description: 'Multi-port GaN V fast charger with 3x USB-C PD 3.1 ports and 1x USB-A. Supports simultaneous 100W laptop charging plus 2 mobile devices with real-time wattage display.',
        price: 5499,
        compareAtPrice: 6999,
        costPrice: 3200,
        stock: 50,
        lowStockThreshold: 10,
        category: catMap.get('kinetic-power'),
        images: [
          'https://images.unsplash.com/photo-1609592807664-2821b0dc3863?w=800',
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'
        ],
        rating: 4.6,
        numReviews: 77,
        tags: ['Power', 'GaN', 'Charger', 'FastCharge'],
        brand: 'NEXORA LABS',
        sku: 'NEX-VOLT-140',
        isFeatured: false,
        attributes: {
          MaxOutput: '140W PD 3.1',
          Technology: 'Gallium Nitride Gen 5',
          Ports: '3x USB-C + 1x USB-A',
          Display: 'OLED Wattage Monitor'
        }
      },
      {
        title: 'CyberMag 20,000mAh Magnetic Power Pod',
        slug: 'cybermag-20000mah-magnetic-power-pod',
        description: 'Transparent cyberpunk aesthetic with cyber circuit illumination. 20,000mAh capacity, 15W Qi2 magnetic fast wireless charging, and 65W bidirectional USB-C output.',
        price: 4299,
        compareAtPrice: 5499,
        costPrice: 2500,
        stock: 30,
        lowStockThreshold: 8,
        category: catMap.get('kinetic-power'),
        images: [
          'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800'
        ],
        rating: 4.75,
        numReviews: 52,
        tags: ['PowerBank', 'Wireless', 'MagSafe', 'Transparent'],
        brand: 'NEXORA LABS',
        sku: 'NEX-CYBERMAG-20K',
        isFeatured: false,
        attributes: {
          Capacity: '20,000mAh / 74Wh',
          Wireless: '15W Magnetic Qi2',
          Wired: '65W USB-C PD',
          Dimensions: '108 x 70 x 24 mm'
        }
      }
    ];

    const products = await Product.insertMany(productsData);
    logger.success(`Created ${products.length} products with complete specifications.`);

    // 4. Initial inventory logs for products
    for (const p of products) {
      await InventoryLog.create({
        product: p._id,
        changeType: 'initial_stock',
        quantityChange: p.stock,
        previousStock: 0,
        newStock: p.stock,
        reason: 'Initial platform stock initialization',
        performedBy: 'System Seed'
      });
    }

    // 5. Create Test Coupons
    const couponsData = [
      {
        code: 'NEXORA20',
        description: '20% off for futuristic shoppers up to ₹2000',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 2000,
        maxDiscount: 2000,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 14,
        isActive: true
      },
      {
        code: 'FUTURE10',
        description: '10% instant discount on orders above ₹1000',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 1000,
        maxDiscount: 1000,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        usedCount: 22,
        isActive: true
      },
      {
        code: 'TECHVIP',
        description: 'Flat ₹500 off on tech orders above ₹2500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 2500,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        usedCount: 7,
        isActive: true
      }
    ];

    await Coupon.insertMany(couponsData);
    logger.success('Created promotional coupons (NEXORA20, FUTURE10, TECHVIP).');

    // 6. Create sample orders for realistic dashboard metrics
    const sampleOrders = [
      {
        orderNumber: 'NEX-2026-F9A1B',
        user: demoCustomer._id,
        items: [
          {
            product: products[0]._id,
            title: products[0].title,
            price: products[0].price,
            quantity: 1,
            image: products[0].images[0],
            subtotal: products[0].price
          }
        ],
        shippingAddress: demoCustomer.addresses[0],
        paymentMethod: 'razorpay',
        paymentStatus: 'completed',
        status: 'Delivered',
        subtotal: 14999,
        shippingFee: 0,
        tax: 2699.82,
        discount: 2000,
        total: 15698.82,
        couponCode: 'NEXORA20',
        trackingNumber: 'NEX-EXP-889912',
        carrier: 'Nexora Express',
        statusHistory: [
          { status: 'Pending', note: 'Order placed', updatedAt: new Date(Date.now() - 7 * 86400000) },
          { status: 'Confirmed', note: 'Payment verified', updatedAt: new Date(Date.now() - 6 * 86400000) },
          { status: 'Processing', note: 'Packed at automated hub', updatedAt: new Date(Date.now() - 5 * 86400000) },
          { status: 'Shipped', note: 'Dispatched via Express Air', updatedAt: new Date(Date.now() - 4 * 86400000) },
          { status: 'Delivered', note: 'Delivered safely to customer', updatedAt: new Date(Date.now() - 3 * 86400000) }
        ],
        createdAt: new Date(Date.now() - 7 * 86400000)
      },
      {
        orderNumber: 'NEX-2026-C4B2E',
        user: demoCustomer._id,
        items: [
          {
            product: products[1]._id,
            title: products[1].title,
            price: products[1].price,
            quantity: 1,
            image: products[1].images[0],
            subtotal: products[1].price
          },
          {
            product: products[6]._id,
            title: products[6].title,
            price: products[6].price,
            quantity: 1,
            image: products[6].images[0],
            subtotal: products[6].price
          }
        ],
        shippingAddress: demoCustomer.addresses[0],
        paymentMethod: 'razorpay',
        paymentStatus: 'completed',
        status: 'Processing',
        subtotal: 30498,
        shippingFee: 0,
        tax: 5489.64,
        discount: 2000,
        total: 33987.64,
        couponCode: 'NEXORA20',
        statusHistory: [
          { status: 'Pending', note: 'Order placed', updatedAt: new Date(Date.now() - 1 * 86400000) },
          { status: 'Confirmed', note: 'Payment completed', updatedAt: new Date(Date.now() - 1 * 86400000) },
          { status: 'Processing', note: 'Preparing order for shipment', updatedAt: new Date() }
        ],
        createdAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        orderNumber: 'NEX-2026-A8D39',
        user: demoCustomer._id,
        items: [
          {
            product: products[2]._id,
            title: products[2].title,
            price: products[2].price,
            quantity: 1,
            image: products[2].images[0],
            subtotal: products[2].price
          }
        ],
        shippingAddress: demoCustomer.addresses[0],
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'Confirmed',
        subtotal: 12499,
        shippingFee: 0,
        tax: 2249.82,
        discount: 500,
        total: 14248.82,
        couponCode: 'TECHVIP',
        statusHistory: [
          { status: 'Confirmed', note: 'COD order confirmed', updatedAt: new Date() }
        ],
        createdAt: new Date()
      }
    ];

    const insertedOrders = await Order.insertMany(sampleOrders);

    // Payments for confirmed orders
    await Payment.create({
      order: insertedOrders[0]._id,
      user: demoCustomer._id,
      gateway: 'Razorpay_Sandbox',
      transactionId: 'txn_mock_seed_001',
      gatewayOrderId: 'order_mock_seed_001',
      amount: insertedOrders[0].total,
      currency: 'INR',
      status: 'completed'
    });

    await Payment.create({
      order: insertedOrders[1]._id,
      user: demoCustomer._id,
      gateway: 'Razorpay_Sandbox',
      transactionId: 'txn_mock_seed_002',
      gatewayOrderId: 'order_mock_seed_002',
      amount: insertedOrders[1].total,
      currency: 'INR',
      status: 'completed'
    });

    logger.success(`Seeded ${insertedOrders.length} sample orders and payments.`);
    logger.success('Database seeding completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (err: any) {
    logger.error(`Seeding error: ${err.message}`, err);
    process.exit(1);
  }
};

seedDatabase();
