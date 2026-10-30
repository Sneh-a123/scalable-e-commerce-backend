import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-2">Hardware Sectors</h1>
        <p className="text-sm text-lavender-grey">Explore tech categorized by operational function & engineering discipline</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-dark-slate/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="group relative h-72 rounded-3xl overflow-hidden border border-white/10 hover:border-electric-purple/50 transition-all duration-300 hover:shadow-glow-purple flex flex-col justify-end p-6"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-60 group-hover:brightness-75 -z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-dark-navy/60 to-transparent -z-10" />

              <span className="text-[11px] font-mono text-neon-lime font-bold uppercase tracking-wider mb-1">
                {cat.productCount !== undefined ? `${cat.productCount} Products Active` : 'Active Sector'}
              </span>
              <h2 className="font-display font-bold text-2xl text-white group-hover:text-neon-lime transition-colors">
                {cat.name}
              </h2>
              <p className="text-xs text-lavender-grey line-clamp-2 mt-2 mb-4 leading-relaxed">
                {cat.description}
              </p>

              <div className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-neon-lime transition-colors">
                <span>Explore Sector</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
