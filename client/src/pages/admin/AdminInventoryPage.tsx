import React, { useEffect, useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  RefreshCw,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';
import { InventoryLog, Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminInventoryPage: React.FC = () => {
  const [overview, setOverview] = useState<{
    lowStockCount: number;
    outOfStockCount: number;
    lowStockProducts: Product[];
    outOfStockProducts: Product[];
    recentLogs: InventoryLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('Restock warehouse batch');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setOverview(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct || quantityChange === 0) return;

    setSubmitting(true);
    try {
      await api.patch(`/inventory/${adjustModalProduct._id}`, {
        quantityChange: Number(quantityChange),
        reason: adjustReason
      });

      showToast(`Stock adjusted by ${quantityChange > 0 ? `+${quantityChange}` : quantityChange}`, 'success');
      setAdjustModalProduct(null);
      fetchInventory();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Adjustment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Inventory Telemetry & Safeguards</h1>
          <p className="text-xs text-lavender-grey mt-1">
            Real-time stock levels, low-threshold alarms, and audited inventory movement logs
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="px-4 py-2 rounded-xl bg-dark-slate hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neon-lime' : ''}`} />
          <span>Sync Stock</span>
        </button>
      </div>

      {/* Critical Stock Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#23151D] border border-coral-red/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-coral-red uppercase tracking-wider">Low Stock Warnings</span>
            <h2 className="font-display font-extrabold text-3xl text-white font-mono">
              {overview?.lowStockCount || 0} Products
            </h2>
            <p className="text-xs text-lavender-grey">Stock is at or below defined minimum buffer threshold</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-coral-red shrink-0" />
        </div>

        <div className="p-6 rounded-3xl bg-dark-slate/60 border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-lavender-grey uppercase tracking-wider">Depleted Inventory</span>
            <h2 className="font-display font-extrabold text-3xl text-white font-mono">
              {overview?.outOfStockCount || 0} Units
            </h2>
            <p className="text-xs text-lavender-grey">Completely out of stock (safe zero limit preserved)</p>
          </div>
          <Boxes className="w-10 h-10 text-electric-purple shrink-0" />
        </div>
      </div>

      {/* Low Stock Action List */}
      {overview?.lowStockProducts && overview.lowStockProducts.length > 0 && (
        <div className="p-6 rounded-3xl bg-dark-slate/60 border border-coral-red/20 space-y-4">
          <div className="flex items-center gap-2 font-display font-bold text-base text-white">
            <AlertTriangle className="w-5 h-5 text-coral-red" />
            <span>Urgent Restock Candidates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-2xl bg-dark-navy/80 border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="truncate">
                  <h4 className="font-semibold text-white text-xs truncate">{p.title}</h4>
                  <span className="text-[11px] text-coral-red font-mono font-bold block">
                    Only {p.stock} units left! (Threshold: {p.lowStockThreshold})
                  </span>
                </div>
                <button
                  onClick={() => setAdjustModalProduct(p)}
                  className="px-3 py-1.5 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-xs shrink-0 shadow-glow-purple"
                >
                  Adjust
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audited Movement Logs */}
      <div className="rounded-3xl bg-dark-slate/60 border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-lime" />
            <span>Audited Movement History (Transactions & Restocks)</span>
          </h2>
          <span className="text-xs text-lavender-grey font-mono">Immutable audit trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-slate border-b border-white/10 text-lavender-grey font-mono uppercase text-[10px]">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Event Type</th>
                <th className="py-4 px-4">Delta</th>
                <th className="py-4 px-4">Previous → New</th>
                <th className="py-4 px-6 text-right">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {overview?.recentLogs?.map((log) => {
                const isPositive = log.quantityChange > 0;
                return (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors text-xs">
                    <td className="py-3 px-6 text-lavender-grey font-normal">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white font-sans truncate max-w-xs">
                      {log.product?.title || 'Hardware Item'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white uppercase">
                        {log.changeType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isPositive ? 'text-mint-green' : 'text-coral-red'
                        }`}
                      >
                        {isPositive ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                        {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-lavender-grey">
                      {log.previousStock} → <strong className="text-white">{log.newStock}</strong>
                    </td>
                    <td className="py-3 px-6 text-right text-lavender-grey/80 font-sans truncate max-w-xs">
                      {log.reason || 'Routine operation'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-base text-white">Adjust Stock Count</h3>
              <button onClick={() => setAdjustModalProduct(null)} className="text-lavender-grey hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-dark-navy text-xs space-y-1">
              <span className="text-lavender-grey block">Target Item:</span>
              <p className="font-bold text-white truncate">{adjustModalProduct.title}</p>
              <span className="text-neon-lime font-mono font-bold block">
                Current Live Stock: {adjustModalProduct.stock} units
              </span>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-lavender-grey mb-1">Quantity Adjustment (positive or negative)</label>
                <input
                  type="number"
                  required
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(Number(e.target.value))}
                  placeholder="e.g. +10 or -5"
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Adjustment Reason / Reference</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Warehouse restock, damage write-off, count audit..."
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-lavender-grey font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-electric-purple text-white font-bold shadow-glow-purple"
                >
                  {submitting ? 'Applying...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
