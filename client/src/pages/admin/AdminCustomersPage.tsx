import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag, DollarSign, Calendar, Eye, X } from 'lucide-react';
import { api } from '../../api/client';
import { User, Pagination, Order } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Customer Detail Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<{
    customer: User;
    orders: Order[];
    metrics: { orderCount: number; totalSpent: number };
  } | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { page: currentPage, limit: 10, search: search.trim() || undefined }
      });
      setCustomers(res.data.data);
      if (res.data.meta?.pagination) setPagination(res.data.meta.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, currentPage]);

  const handleViewCustomer = async (id: string) => {
    try {
      const res = await api.get(`/customers/${id}`);
      setSelectedCustomer(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-white">Registered Customer Directory</h1>
        <p className="text-xs text-lavender-grey mt-1">
          Inspect customer purchasing frequency, lifetime spend, and address records
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-dark-slate/60 border border-white/5">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-lavender-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-dark-navy border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="rounded-3xl bg-dark-slate/60 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-slate border-b border-white/10 text-lavender-grey font-mono uppercase text-[10px]">
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-4">Orders Placed</th>
                <th className="py-4 px-4">Total Spent</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-lavender-grey">
                    Querying customer collection...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-lavender-grey">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center font-bold text-white text-xs">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{c.name}</span>
                        <span className="text-[11px] text-lavender-grey">{c.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-lavender-grey">{c.phone || 'No phone'}</td>

                    <td className="py-4 px-4 text-lavender-grey">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active'}
                    </td>

                    <td className="py-4 px-4 font-mono text-white font-bold">{c.orderCount || 0}</td>

                    <td className="py-4 px-4 font-mono font-bold text-neon-lime">
                      ₹{c.totalSpent?.toLocaleString('en-IN') || 0}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewCustomer(c._id || c.id)}
                        className="px-3 py-1.5 rounded-lg bg-electric-purple/20 hover:bg-electric-purple text-white font-semibold text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-electric-purple flex items-center justify-center text-white font-bold">
                  {selectedCustomer.customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    {selectedCustomer.customer.name}
                  </h3>
                  <span className="text-xs text-lavender-grey">{selectedCustomer.customer.email}</span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-lavender-grey hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-dark-navy border border-white/5">
                <span className="text-[11px] text-lavender-grey block">Total Order Count</span>
                <span className="font-display font-bold text-xl text-white font-mono">
                  {selectedCustomer.metrics.orderCount} Orders
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-dark-navy border border-white/5">
                <span className="text-[11px] text-lavender-grey block">Cumulative Spend</span>
                <span className="font-display font-bold text-xl text-neon-lime font-mono">
                  ₹{selectedCustomer.metrics.totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Customer Orders */}
            <div className="space-y-3">
              <span className="font-bold text-sm text-white block">Order History</span>
              {selectedCustomer.orders.length === 0 ? (
                <p className="text-xs text-lavender-grey">No orders recorded for this user.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCustomer.orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-3 rounded-xl bg-dark-navy/70 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-white">#{ord.orderNumber}</span>
                        <span className="text-lavender-grey/60 block text-[10px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white">
                          {ord.status}
                        </span>
                        <span className="font-mono font-bold text-neon-lime">
                          ₹{ord.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
