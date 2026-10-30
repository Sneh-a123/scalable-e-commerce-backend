import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../../api/client';
import { AnalyticsOverview, Order } from '../../types';

export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsOverview | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, trendsRes, ordersRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/revenue?days=14'),
        api.get('/orders?limit=6')
      ]);

      setMetrics(overviewRes.data.data);
      setRevenueTrends(trendsRes.data.data);
      setRecentOrders(ordersRes.data.data);
    } catch (err) {
      console.error('Failed to load admin overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Ops Control Center</h1>
          <p className="text-xs text-lavender-grey mt-1">
            Real-time aggregate telemetry computed directly from MongoDB collections
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-dark-slate hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neon-lime' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="p-5 rounded-2xl bg-dark-slate/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-grey">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-neon-lime" />
          </div>
          <span className="font-display font-extrabold text-2xl text-neon-lime block font-mono">
            ₹{metrics?.totalRevenue?.toLocaleString('en-IN') || 0}
          </span>
          <span className="text-[10px] text-mint-green block">Confirmed Sales</span>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="p-5 rounded-2xl bg-dark-slate/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-grey">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-electric-purple" />
          </div>
          <span className="font-display font-extrabold text-2xl text-white block font-mono">
            {metrics?.totalOrders || 0}
          </span>
          <span className="text-[10px] text-lavender-grey block">Lifetime Records</span>
        </div>

        {/* Metric 3: Total Customers */}
        <div className="p-5 rounded-2xl bg-dark-slate/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-grey">
            <span>Customers</span>
            <Users className="w-4 h-4 text-mint-green" />
          </div>
          <span className="font-display font-extrabold text-2xl text-white block font-mono">
            {metrics?.totalCustomers || 0}
          </span>
          <span className="text-[10px] text-lavender-grey block">Registered Users</span>
        </div>

        {/* Metric 4: Total Products */}
        <div className="p-5 rounded-2xl bg-dark-slate/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-grey">
            <span>Catalog Items</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-display font-extrabold text-2xl text-white block font-mono">
            {metrics?.totalProducts || 0}
          </span>
          <span className="text-[10px] text-lavender-grey block">Active Hardware</span>
        </div>

        {/* Metric 5: Pending Orders */}
        <div className="p-5 rounded-2xl bg-dark-slate/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-grey">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-electric-purple" />
          </div>
          <span className="font-display font-extrabold text-2xl text-electric-purple block font-mono">
            {metrics?.pendingOrders || 0}
          </span>
          <span className="text-[10px] text-electric-purple block">Awaiting Dispatch</span>
        </div>

        {/* Metric 6: Low Stock Alert */}
        <div className="p-5 rounded-2xl bg-dark-slate/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-lavender-grey">
            <span>Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-coral-red" />
          </div>
          <span className="font-display font-extrabold text-2xl text-coral-red block font-mono">
            {metrics?.lowStockProducts || 0}
          </span>
          <span className="text-[10px] text-coral-red block">Below Threshold</span>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-lime" />
              14-Day Sales Velocity
            </h2>
            <p className="text-xs text-lavender-grey mt-0.5">Real-time daily transaction aggregate</p>
          </div>
          <Link
            to="/admin/analytics"
            className="text-xs font-bold text-neon-lime hover:underline flex items-center gap-1"
          >
            <span>Deep Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrends.length > 0 ? revenueTrends : [{ date: 'Today', revenue: metrics?.totalRevenue || 0 }]}>
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242235" />
              <XAxis dataKey="date" stroke="#B9B8C9" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#B9B8C9"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1B1A2A',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#purpleGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white">Recent Purchases</h2>
          <Link to="/admin/orders" className="text-xs font-bold text-neon-lime hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-lavender-grey font-mono uppercase text-[10px]">
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Total</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((ord) => (
                <tr key={ord._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">#{ord.orderNumber}</td>
                  <td className="py-3 text-white">
                    {typeof ord.user === 'object' ? ord.user.name : ord.shippingAddress.fullName}
                  </td>
                  <td className="py-3 text-lavender-grey">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-neon-lime">
                    ₹{ord.total.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-3 py-1 rounded-lg bg-electric-purple/20 hover:bg-electric-purple text-white font-semibold transition-colors"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
