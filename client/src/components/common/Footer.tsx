import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0C0C14] border-t border-white/5 pt-16 pb-12 text-lavender-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-neon-lime" />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-wider">NEXORA</span>
            </div>
            <p className="text-xs leading-relaxed text-lavender-grey/80 mb-4">
              Next-generation e-commerce platform engineered with Node.js, Express, MongoDB, and Redis caching. Designed for ultra-high concurrency and zero overselling.
            </p>
            <div className="flex items-center gap-2 text-xs text-mint-green font-mono">
              <span className="w-2 h-2 rounded-full bg-mint-green animate-ping"></span>
              All Systems Operational (API v1)
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Storefront</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-white transition-colors">Trending Hardware</Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-white transition-colors">New Drops</Link>
              </li>
            </ul>
          </div>

          {/* Engineering & Architecture */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Architecture</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-electric-purple" />
                <span>MongoDB Replica Safe</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-neon-lime" />
                <span>Redis In-Memory Caching</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-mint-green" />
                <span>Atomic Inventory Deductions</span>
              </li>
              <li className="flex items-center gap-2 text-lavender-grey">
                <span>Cryptographic HMAC Sandbox</span>
              </li>
            </ul>
          </div>

          {/* Sandbox & Payments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Sandbox Gateways</h4>
            <p className="text-xs text-lavender-grey/80 mb-3">
              Payment sandbox configured for testing with test signatures. No real financial credentials required.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2.5 py-1 rounded-md bg-dark-slate border border-white/10 text-white">Razorpay Test</span>
              <span className="px-2.5 py-1 rounded-md bg-dark-slate border border-white/10 text-white">Stripe Test</span>
              <span className="px-2.5 py-1 rounded-md bg-dark-slate border border-white/10 text-white">COD Available</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 NEXORA Platform.</p>
          <div className="flex items-center gap-1 text-lavender-grey/60">
            <span>Built with precision & high concurrency</span>
            <Heart className="w-3.5 h-3.5 text-coral-red inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
