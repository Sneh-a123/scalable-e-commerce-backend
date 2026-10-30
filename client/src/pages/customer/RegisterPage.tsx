import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsSubmitting(true);
    try {
      await register({ name, email, password, phone: phone || undefined });
      navigate('/');
    } catch {
      // toast shown in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-8 space-y-6 shadow-2xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center mx-auto mb-4 shadow-glow-purple">
            <Sparkles className="w-6 h-6 text-neon-lime" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">Create Nexora Identity</h1>
          <p className="text-xs text-lavender-grey mt-1">Join the futuristic high-performance commerce network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-lavender-grey mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-lavender-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Aiden Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-lavender-grey mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-lavender-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="aiden@nexora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-lavender-grey mb-1.5">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-lavender-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-lavender-grey/40 focus:outline-none focus:border-electric-purple"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-lavender-grey mb-1.5">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-lavender-grey absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-lavender-grey">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-neon-lime hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
