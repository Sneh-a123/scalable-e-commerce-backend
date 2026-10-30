import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // error handled by toast in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@nexora.com');
      setPassword('Admin@12345');
    } else {
      setEmail('customer@nexora.com');
      setPassword('Customer@12345');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-8 space-y-8 shadow-2xl relative">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
            <Sparkles className="w-6 h-6 text-neon-lime" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">Welcome Back</h1>
          <p className="text-xs text-lavender-grey mt-1">Access your persistent orders and hardware wishlist</p>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div className="p-3.5 rounded-2xl bg-dark-slate/80 border border-white/5 space-y-2">
          <span className="text-[10px] font-mono text-neon-lime uppercase font-bold block text-center">
            One-Click Test Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-mint-green" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="px-3 py-2 rounded-xl bg-electric-purple/15 hover:bg-electric-purple/25 border border-electric-purple/40 text-xs font-semibold text-neon-lime flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-neon-lime" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-lavender-grey mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-lavender-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@nexora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-lavender-grey">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-lavender-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-electric-purple hover:bg-electric-purple/90 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-purple active:scale-98 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-lavender-grey">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-neon-lime hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
