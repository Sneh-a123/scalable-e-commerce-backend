import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading } = useCart();

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product._id, 1);
    }
  };

  const categoryName = typeof product.category === 'object' ? product.category.name : 'Hardware';

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex flex-col bg-dark-slate/80 hover:bg-dark-slate border border-white/5 hover:border-electric-purple/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-purple hover:-translate-y-1"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#161522]">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-neon-lime text-dark-navy shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-electric-purple/90 text-white flex items-center gap-1 backdrop-blur-sm">
              <Zap className="w-3 h-3 text-neon-lime" />
              HOT DROP
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-coral-red/90 text-white backdrop-blur-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-coral-red/20 text-coral-red border border-coral-red/40 backdrop-blur-md">
              Only {product.stock} left!
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-lavender-grey mb-1.5 font-medium">
            <span className="text-[11px] uppercase tracking-wider text-electric-purple">{categoryName}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-white text-xs font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-[11px] text-lavender-grey/70">({product.numReviews})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-neon-lime transition-colors leading-snug mb-2">
            {product.title}
          </h3>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-lg text-white">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-lavender-grey/60 line-through">
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-mint-green block">Free Express Delivery</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-white/5 text-lavender-grey/40 cursor-not-allowed'
                : 'bg-electric-purple hover:bg-electric-purple/90 text-white shadow-glow-purple active:scale-95'
            }`}
            title={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};
