import { Order, Product, User, Category } from '../models';

export class AnalyticsService {
  /**
   * Returns top-level summary metrics directly computed from MongoDB
   */
  static async getOverviewMetrics() {
    const [
      revenueData,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts
    ] = await Promise.all([
      // Total Revenue from paid/confirmed orders
      Order.aggregate([
        {
          $match: {
            status: { $nin: ['Cancelled', 'Payment Failed'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]),

      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isArchived: { $ne: true } }),
      Order.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'Processing'] } }),
      Product.countDocuments({
        $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
        isArchived: { $ne: true }
      })
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const averageOrderValue = Math.round((revenueData[0]?.averageOrderValue || 0) * 100) / 100;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      averageOrderValue
    };
  }

  /**
   * Daily revenue and order trend for the past N days
   */
  static async getRevenueTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Payment Failed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          itemsSold: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orders: 1,
          itemsSold: 1
        }
      }
    ]);

    return trends;
  }

  /**
   * Monthly sales history
   */
  static async getMonthlySales() {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);

    const monthly = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['Cancelled', 'Payment Failed'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orders: 1
        }
      }
    ]);

    return monthly;
  }

  /**
   * Best-selling products ranked by total units sold and revenue
   */
  static async getBestSellingProducts(limit: number = 5) {
    const bestSellers = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['Cancelled', 'Payment Failed'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.quantity' },
          totalSales: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDoc'
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          image: 1,
          unitsSold: 1,
          totalSales: { $round: ['$totalSales', 2] },
          currentStock: { $arrayElemAt: ['$productDoc.stock', 0] },
          price: { $arrayElemAt: ['$productDoc.price', 0] }
        }
      }
    ]);

    return bestSellers;
  }

  /**
   * Category performance breakdown
   */
  static async getCategoryPerformance() {
    const categoryStats = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['Cancelled', 'Payment Failed'] }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: '$items.subtotal' },
          unitsSold: { $sum: '$items.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          revenue: { $round: ['$revenue', 2] },
          unitsSold: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    return categoryStats;
  }

  /**
   * Distribution of orders by their current status
   */
  static async getOrderStatusDistribution() {
    const distribution = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    return distribution;
  }

  /**
   * Monthly new customer registrations
   */
  static async getCustomerGrowth() {
    const growth = await User.aggregate([
      {
        $match: { role: 'customer' }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          newCustomers: 1
        }
      }
    ]);

    return growth;
  }
}
