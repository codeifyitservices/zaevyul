import Order from '../model/Order.js';
import Product from '../model/Product.js';
import Customer from '../model/Customer.js';

export const getReports = async (req, res) => {
  try {
    // Run all independent DB queries in parallel
    const [
      totalCustomers,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalOrdersCount,
      pendingOrdersCount,
      revenueAgg,
      categoryAgg,
      monthlyReportAgg,
      topProductsAgg,
    ] = await Promise.all([
      // 1. Count customers
      Customer.countDocuments(),

      // 2. Count products
      Product.countDocuments(),

      // 3. Low stock count using individual product thresholds
      Product.countDocuments({
        $expr: {
          $and: [
            { $gt: ['$quantity', 0] },
            { $lte: ['$quantity', '$lowStockThreshold'] }
          ]
        }
      }),

      // 4. Out of stock count
      Product.countDocuments({ quantity: 0 }),

      // 5. Total orders count
      Order.countDocuments(),

      // 6. Pending orders count
      Order.countDocuments({ status: 'pending' }),

      // 7. Revenue aggregation
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]),

      // 8. Category sales breakdown via aggregation
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDoc'
          }
        },
        { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$productDoc.category',
            qtySold: { $sum: '$items.qty' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDoc'
          }
        },
        { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: { $ifNull: ['$categoryDoc.name', 'Uncategorised'] },
            qtySold: 1
          }
        }
      ]),

      // 9. Monthly sales aggregate for the last 12 months
      Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // 10. Top selling products aggregate
      Order.aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            sold: { $sum: '$items.qty' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
            name: { $first: '$items.name' }
          }
        },
        { $sort: { sold: -1 } },
        { $limit: 5 }
      ])
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;
    const inStockCount = Math.max(0, totalProducts - outOfStockCount - lowStockCount);

    // Calculate category percentage breakdown
    const totalQtySold = categoryAgg.reduce((sum, c) => sum + c.qtySold, 0);
    let categoryBreakdown = categoryAgg
      .map(c => ({
        name: c.name,
        value: totalQtySold > 0 ? Math.round((c.qtySold / totalQtySold) * 100) : 0
      }))
      .filter(c => c.value > 0);

    if (categoryBreakdown.length === 0) {
      categoryBreakdown = [
        { name: 'Shawls', value: 60 },
        { name: 'Stoles', value: 25 },
        { name: 'Blankets', value: 15 }
      ];
    }

    const monthsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyReportMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = monthsLabels[d.getMonth()];
      const key = `${year}-${month}`;
      monthlyReportMap[key] = { month: label, revenue: 0, orders: 0 };
    }

    for (const item of monthlyReportAgg) {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthlyReportMap[key]) {
        monthlyReportMap[key].revenue = item.revenue;
        monthlyReportMap[key].orders = item.orders;
      }
    }

    const monthlyReport = Object.values(monthlyReportMap);

    const topProducts = topProductsAgg.map(p => ({
      name: p.name || 'Pashmina Item',
      sold: p.sold || 0,
      revenue: p.revenue || 0
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount,
        totalCustomers,
        totalProducts,
        inStockCount,
        lowStockCount,
        outOfStockCount
      },
      categoryBreakdown,
      monthlyReport,
      topProducts
    });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
