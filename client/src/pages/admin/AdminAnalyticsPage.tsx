import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../../api/client';
import { BarChart3, TrendingUp, PieChart as PieIcon, Award, Layers } from 'lucide-react';

const COLORS = ['#8B5CF6', '#D9FF57', '#34D399', '#FB7185', '#60A5FA', '#FBBF24'];

export const AdminAnalyticsPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [categoryPerf, setCategoryPerf] = useState<any[]>([]);
  const [statusDist, setStatusDist] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [revRes, monthRes, bestRes, catRes, distRes, custRes] = await Promise.all([
          api.get('/analytics/revenue?days=30'),
          api.get('/analytics/monthly'),
          api.get('/analytics/products?limit=5'),
          api.get('/analytics/categories'),
          api.get('/analytics/orders'),
          api.get('/analytics/customers')
        ]);

        setRevenueData(revRes.data.data);
        setMonthlySales(monthRes.data.data);
        setBestSellers(bestRes.data.data);
        setCategoryPerf(catRes.data.data);
        setStatusDist(distRes.data.data);
        setCustomerGrowth(custRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-white">Advanced Commerce Analytics</h1>
        <p className="text-xs text-lavender-grey mt-1">
          High-precision multi-dimensional charts powered by real-time MongoDB Aggregations
        </p>
      </div>

      {/* Grid 1: 30-Day Revenue & Monthly Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 30-Day Revenue Trend */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white">
            <TrendingUp className="w-5 h-5 text-neon-lime" />
            <span>30-Day Revenue Curve</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="limeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9FF57" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D9FF57" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#242235" />
                <XAxis dataKey="date" stroke="#B9B8C9" fontSize={10} tickLine={false} />
                <YAxis stroke="#B9B8C9" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D9FF57" strokeWidth={2} fill="url(#limeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales Breakdown */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white">
            <BarChart3 className="w-5 h-5 text-electric-purple" />
            <span>Monthly Revenue Aggregate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242235" />
                <XAxis dataKey="month" stroke="#B9B8C9" fontSize={10} tickLine={false} />
                <YAxis stroke="#B9B8C9" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Monthly Sales']}
                />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Best-Selling Products & Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Best-Sellers (8 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Top Performing Hardware (Units Sold)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#242235" />
                <XAxis type="number" stroke="#B9B8C9" fontSize={10} />
                <YAxis dataKey="title" type="category" stroke="#B9B8C9" fontSize={10} width={120} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B1A2A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                  formatter={(val: any) => [val, 'Units Sold']}
                />
                <Bar dataKey="unitsSold" fill="#34D399" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white">
            <PieIcon className="w-5 h-5 text-neon-lime" />
            <span>Order Status Share</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {statusDist.length === 0 ? (
              <span className="text-xs text-lavender-grey">No order data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDist}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B1A2A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#B9B8C9' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid 3: Category Performance Breakdown */}
      <div className="p-6 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-4">
        <div className="flex items-center gap-2 font-display font-bold text-base text-white">
          <Layers className="w-5 h-5 text-neon-lime" />
          <span>Sector / Category Revenue Share</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {categoryPerf.map((c) => (
            <div key={c.category} className="p-4 rounded-2xl bg-dark-navy/70 border border-white/5 space-y-1">
              <span className="text-xs font-semibold text-white">{c.category}</span>
              <span className="font-display font-extrabold text-lg text-neon-lime block font-mono">
                ₹{c.revenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-lavender-grey block">{c.unitsSold} units shipped</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
