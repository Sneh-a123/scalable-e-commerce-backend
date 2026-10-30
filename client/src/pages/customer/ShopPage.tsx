import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import { Product, Category, Pagination } from '../../types';
import { ProductCard } from '../../components/customer/ProductCard';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load categories
  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch products whenever filters or page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          limit: 12,
          sort
        };

        if (search.trim()) params.search = search.trim();
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (inStockOnly) params.inStock = true;

        const res = await api.get('/products', { params });
        setProducts(res.data.data);
        if (res.data.meta?.pagination) {
          setPagination(res.data.meta.pagination);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sort, minPrice, maxPrice, inStockOnly, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Catalog Sector</h1>
          <p className="text-xs text-lavender-grey mt-1">
            Displaying {pagination.total} engineered devices & accessories
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-lavender-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search gear..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-dark-slate border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-lavender-grey/60 focus:outline-none focus:border-electric-purple"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-lavender-grey hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-dark-slate border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-purple cursor-pointer"
          >
            <option value="newest">Newest Drops</option>
            <option value="popular">Popularity & Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-dark-slate border border-white/10 text-white flex items-center gap-2 text-xs font-semibold"
          >
            <Filter className="w-4 h-4 text-neon-lime" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-dark-slate/60 border border-white/5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-display font-bold text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-neon-lime" />
                Parameters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-lavender-grey hover:text-white hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Categories */}
            <div>
              <span className="text-xs font-mono font-bold text-lavender-grey uppercase tracking-wider block mb-3">
                Sector Categories
              </span>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-electric-purple text-white shadow-glow-purple font-bold'
                      : 'text-lavender-grey hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>All Hardware</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-electric-purple text-white shadow-glow-purple font-bold'
                        : 'text-lavender-grey hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.productCount !== undefined && (
                      <span className="text-[10px] opacity-70">({cat.productCount})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <span className="text-xs font-mono font-bold text-lavender-grey uppercase tracking-wider block mb-3">
                Price Filter (₹)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-purple"
                />
                <span className="text-lavender-grey">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-purple"
                />
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-white/5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-white">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-dark-navy text-electric-purple focus:ring-0 cursor-pointer"
                />
                <span>In Stock Hardware Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-dark-slate/40 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 rounded-3xl bg-dark-slate/40 border border-white/5 text-center flex flex-col items-center justify-center">
              <Search className="w-12 h-12 text-lavender-grey/40 mb-3" />
              <h3 className="font-display font-bold text-lg text-white mb-1">No Hardware Found</h3>
              <p className="text-xs text-lavender-grey max-w-sm mb-6">
                No products match the selected filters or search keyword. Try clearing some filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-2.5 rounded-xl bg-dark-slate border border-white/10 hover:bg-white/5 disabled:opacity-40 text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPage(num)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === num
                          ? 'bg-electric-purple text-white shadow-glow-purple'
                          : 'bg-dark-slate border border-white/10 text-lavender-grey hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage >= pagination.totalPages}
                    className="p-2.5 rounded-xl bg-dark-slate border border-white/10 hover:bg-white/5 disabled:opacity-40 text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-dark-slate border border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-display font-bold text-base text-white">Filter Parameters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-lavender-grey hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Select */}
            <div>
              <span className="text-xs font-mono font-bold text-lavender-grey uppercase block mb-2">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
              >
                <option value="all">All Hardware</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price inputs */}
            <div>
              <span className="text-xs font-mono font-bold text-lavender-grey uppercase block mb-2">Price Range</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 rounded-xl bg-electric-purple text-white font-bold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
