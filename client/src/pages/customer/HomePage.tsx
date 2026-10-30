import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Tag,
  Headphones,
  Watch,
  Keyboard,
  Check
} from 'lucide-react';
import { api } from '../../api/client';
import { Product, Category } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';

interface HomePageProps {
  onOpenAiCopilot: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAiCopilot }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=6'),
          api.get('/categories')
        ]);
        setFeaturedProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Futuristic Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-electric-purple/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-neon-lime/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-slate/80 border border-electric-purple/40 shadow-glow-purple mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-neon-lime animate-ping"></span>
            <span className="text-xs font-mono font-semibold text-white tracking-wide">
              NEXORA V1.0 • HIGH-CONCURRENCY ARCHITECTURE
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            GEAR FROM THE FUTURE.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-purple via-white to-neon-lime">
              BUILT TO SCALE.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-lavender-grey max-w-2xl leading-relaxed mb-10">
            Engineered with atomic inventory reservation, Redis caching, and real-time LLM shopping intelligence. Zero overselling, guaranteed.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              to="/shop"
              className="px-8 py-4 rounded-2xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-sm flex items-center gap-2 shadow-glow-purple hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={onOpenAiCopilot}
              className="px-8 py-4 rounded-2xl bg-dark-slate/90 hover:bg-dark-slate border border-electric-purple/40 text-white font-bold text-sm flex items-center gap-2 hover:border-neon-lime transition-all"
            >
              <Sparkles className="w-4 h-4 text-neon-lime" />
              <span>Ask AI Copilot</span>
            </button>
          </div>

          {/* Metric Callouts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="p-4 rounded-2xl bg-dark-slate/50 border border-white/5 backdrop-blur-sm">
              <span className="font-display font-extrabold text-2xl text-neon-lime block font-mono">0.00%</span>
              <span className="text-xs text-lavender-grey">Oversell Probability</span>
            </div>
            <div className="p-4 rounded-2xl bg-dark-slate/50 border border-white/5 backdrop-blur-sm">
              <span className="font-display font-extrabold text-2xl text-white block font-mono">&lt; 15ms</span>
              <span className="text-xs text-lavender-grey">Redis Cache Latency</span>
            </div>
            <div className="p-4 rounded-2xl bg-dark-slate/50 border border-white/5 backdrop-blur-sm">
              <span className="font-display font-extrabold text-2xl text-electric-purple block font-mono">HMAC-256</span>
              <span className="text-xs text-lavender-grey">Payment Sandbox Signature</span>
            </div>
            <div className="p-4 rounded-2xl bg-dark-slate/50 border border-white/5 backdrop-blur-sm">
              <span className="font-display font-extrabold text-2xl text-mint-green block font-mono">100%</span>
              <span className="text-xs text-lavender-grey">Idempotent Safe Orders</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Curated Sectors</h2>
            <p className="text-xs text-lavender-grey mt-1">Browse futuristic hardware designed for next-gen workflows</p>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-neon-lime hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 3).map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group relative h-56 rounded-3xl overflow-hidden border border-white/10 hover:border-electric-purple/50 transition-all duration-300 hover:shadow-glow-purple"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/40 to-transparent p-6 flex flex-col justify-end">
                <span className="text-xs font-mono text-neon-lime uppercase font-bold tracking-wider mb-1">
                  Sector {cat.slug.toUpperCase()}
                </span>
                <h3 className="font-display font-bold text-xl text-white group-hover:text-neon-lime transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-lavender-grey/90 line-clamp-1 mt-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Hot Drops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-electric-purple animate-pulse"></span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Hot Drops</h2>
            </div>
            <p className="text-xs text-lavender-grey mt-1">Limited batch engineering units available now</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-lavender-grey hover:text-white flex items-center gap-1"
          >
            <span>See Full Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-dark-slate/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Active Promo Coupons Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-neon-lime/30 relative overflow-hidden bg-gradient-to-br from-dark-slate via-dark-navy to-dark-slate">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-neon-lime/20 text-neon-lime inline-block mb-3">
              ACTIVE PROTOCOLS • TEST COUPONS
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-3">
              Unlock Instant Discounts at Checkout
            </h2>
            <p className="text-xs sm:text-sm text-lavender-grey leading-relaxed mb-6">
              Apply these live discount coupons during checkout to test server-side coupon validation, percentage calculation, and price deductions.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                { code: 'NEXORA20', desc: '20% OFF (Up to ₹2000)' },
                { code: 'FUTURE10', desc: '10% Instant Discount' },
                { code: 'TECHVIP', desc: 'Flat ₹500 OFF (Orders > ₹2500)' }
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => copyCoupon(c.code)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-navy/90 border border-white/10 hover:border-neon-lime text-xs transition-all group"
                  title="Click to copy coupon code"
                >
                  <Tag className="w-3.5 h-3.5 text-neon-lime group-hover:rotate-12 transition-transform" />
                  <span className="font-mono font-bold text-white">{c.code}</span>
                  <span className="text-[11px] text-lavender-grey">({c.desc})</span>
                  {copiedCoupon === c.code ? (
                    <Check className="w-3.5 h-3.5 text-mint-green ml-1" />
                  ) : (
                    <span className="text-[10px] text-lavender-grey/60 uppercase font-mono ml-1">Copy</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Architecture & SDE Engineering Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-3">
            Engineered For Amazon SDE Portfolio Excellence
          </h2>
          <p className="text-xs sm:text-sm text-lavender-grey">
            Unlike simple demo apps, NEXORA is built to withstand high load, preventing overselling under concurrent requests with strict distributed transactional guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-dark-slate/70 border border-white/5 hover:border-electric-purple/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-neon-lime" />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Atomic Stock Locking</h3>
            <p className="text-xs text-lavender-grey leading-relaxed">
              Uses conditional MongoDB atomic operations (<code className="text-neon-lime font-mono">$inc: -qty</code> where <code className="text-neon-lime font-mono">stock &gt;= qty</code>). Simultaneous checkouts cannot drop stock below zero.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-slate/70 border border-white/5 hover:border-electric-purple/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-electric-purple" />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Redis Invalidation</h3>
            <p className="text-xs text-lavender-grey leading-relaxed">
              Cached product queries with automatic cache invalidation on catalog updates. Automatic fallback to high-speed in-memory store if Redis is unavailable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-slate/70 border border-white/5 hover:border-electric-purple/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-mint-green" />
            </div>
            <h3 className="font-display font-bold text-base text-white mb-2">Payment Cryptography</h3>
            <p className="text-xs text-lavender-grey leading-relaxed">
              HMAC SHA-256 server-side signature verification prevents client tampering. Supports Razorpay/Stripe sandbox with instant simulator checks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
