import React, { useEffect, useState } from 'react';
import { CreditCard, Search, RotateCcw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../../api/client';
import { Payment } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: string, amount: number) => {
    if (!confirm(`Issue refund of ₹${amount.toLocaleString('en-IN')} for this transaction?`)) return;
    try {
      await api.post(`/payments/${paymentId}/refund`, {
        reason: 'Admin approved customer refund'
      });
      showToast('Refund issued successfully!', 'success');
      fetchPayments();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Refund failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-white">Payment Ledger & Transactions</h1>
        <p className="text-xs text-lavender-grey mt-1">
          Cryptographic sandbox audits, transaction IDs, payment gateways, and refund logs
        </p>
      </div>

      <div className="rounded-3xl bg-dark-slate/60 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-slate border-b border-white/10 text-lavender-grey font-mono uppercase text-[10px]">
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-4">Order Ref</th>
                <th className="py-4 px-4">Gateway</th>
                <th className="py-4 px-4">Amount</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-6 text-right">Refund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-lavender-grey font-sans">
                    Loading financial ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-lavender-grey font-sans">
                    No payment records in ledger.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-white truncate max-w-xs">{p.transactionId}</td>
                    <td className="py-4 px-4 text-electric-purple">
                      {typeof p.order === 'object' ? `#${p.order.orderNumber}` : p.order}
                    </td>
                    <td className="py-4 px-4 text-white font-sans">{p.gateway}</td>
                    <td className="py-4 px-4 font-bold text-neon-lime">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.status === 'completed'
                            ? 'bg-mint-green/20 text-mint-green'
                            : p.status === 'refunded'
                            ? 'bg-amber-400/20 text-amber-400'
                            : 'bg-coral-red/20 text-coral-red'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-lavender-grey font-sans text-[11px]">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-sans">
                      {p.status === 'completed' ? (
                        <button
                          onClick={() => handleRefund(p._id, p.amount)}
                          className="px-3 py-1.5 rounded-lg bg-coral-red/10 hover:bg-coral-red/20 text-coral-red text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-lavender-grey/40">
                          {p.status === 'refunded' ? 'Refunded' : 'N/A'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
