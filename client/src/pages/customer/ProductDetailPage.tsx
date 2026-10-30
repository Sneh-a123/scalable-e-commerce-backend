import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Check,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { api } from '../../api/client';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from '../../components/customer/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data.data;
        setProduct(p);
        setSelectedImage(p.images?.[0] || '');
        setQuantity(1);

        // Fetch related products from same category
        const catId = typeof p.category === 'object' ? p.category._id : p.category;
        const relRes = await api.get(`/products?category=${catId}&limit=4`);
        setRelatedProducts(relRes.data.data.filter((item: Product) => item._id !== p._id));
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-dark-slate/40 rounded-3xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 bg-dark-slate/40 rounded-xl w-3/4 animate-pulse" />
            <div className="h-4 bg-dark-slate/40 rounded-xl w-1/2 animate-pulse" />
            <div className="h-24 bg-dark-slate/40 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <Link to="/shop" className="text-electric-purple hover:underline text-sm font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product._id, quantity);
    }
  };

  const categoryName = typeof product.category === 'object' ? product.category.name : 'Hardware';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-lavender-grey">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-[#161522] border border-white/10 relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl text-xs font-bold bg-electric-purple text-white flex items-center gap-1 shadow-glow-purple">
                <Zap className="w-3.5 h-3.5 text-neon-lime" />
                FLAGSHIP DROP
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-neon-lime shadow-glow-lime'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-electric-purple/20 text-electric-purple">
                {categoryName.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-lavender-grey">SKU: {product.sku || 'NEX-PRO'}</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-3 leading-tight">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-lavender-grey/30'
                    }`}
                  />
                ))}
                <span className="text-white font-bold text-xs ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-lavender-grey">({product.numReviews} Verified Reviews)</span>
            </div>

            {/* Price block */}
            <div className="p-5 rounded-2xl bg-dark-slate/60 border border-white/5 mb-6 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-lavender-grey uppercase tracking-wider block mb-1">Price</span>
                <div className="flex items-baseline gap-3">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-lavender-grey/60 line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-neon-lime text-dark-navy font-mono">
                  SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="mb-6">
              {isOutOfStock ? (
                <div className="p-3 rounded-xl bg-coral-red/10 border border-coral-red/30 text-coral-red text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-coral-red"></span>
                  Out of Stock. Next batch restocking soon.
                </div>
              ) : isLowStock ? (
                <div className="p-3 rounded-xl bg-coral-red/10 border border-coral-red/30 text-coral-red text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-coral-red animate-ping"></span>
                  Hurry! Only {product.stock} units remaining in inventory.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-mint-green/10 border border-mint-green/30 text-mint-green text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  In Stock & Ready for Same-Day Dispatch ({product.stock} available)
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-lavender-grey leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center rounded-2xl bg-dark-slate border border-white/10 p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2.5 rounded-xl hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold font-mono text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2.5 rounded-xl hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-4 px-8 rounded-2xl bg-electric-purple hover:bg-electric-purple/90 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-purple active:scale-98 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Sold Out' : `Add ${quantity} to Cart`}</span>
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-center">
            <div className="p-3 rounded-xl bg-dark-slate/40 border border-white/5">
              <Truck className="w-5 h-5 text-neon-lime mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-white block">Free Shipping</span>
              <span className="text-[10px] text-lavender-grey">Orders over ₹1500</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-slate/40 border border-white/5">
              <ShieldCheck className="w-5 h-5 text-electric-purple mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-white block">2 Year Warranty</span>
              <span className="text-[10px] text-lavender-grey">Nexora Care+</span>
            </div>
            <div className="p-3 rounded-xl bg-dark-slate/40 border border-white/5">
              <RotateCcw className="w-5 h-5 text-mint-green mx-auto mb-1.5" />
              <span className="text-[11px] font-bold text-white block">14 Day Returns</span>
              <span className="text-[10px] text-lavender-grey">Hassle-free policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <section className="p-8 rounded-3xl bg-dark-slate/50 border border-white/5">
          <h2 className="font-display font-extrabold text-xl text-white mb-6">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3.5 rounded-xl bg-dark-navy/60 border border-white/5 text-xs"
              >
                <span className="font-semibold text-lavender-grey font-mono">{key}</span>
                <span className="font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-display font-extrabold text-2xl text-white mb-6">Related Sector Gear</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
