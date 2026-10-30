import React, { useEffect, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api } from '../../api/client';
import { Product, Category, Pagination } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    category: '',
    images: '',
    sku: '',
    isFeatured: false
  });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: 10,
        sort: 'newest'
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await api.get('/products', { params });
      setProducts(res.data.data);
      if (res.data.meta?.pagination) setPagination(res.data.meta.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data.data);
      if (res.data.data.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: res.data.data[0]._id }));
      }
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, currentPage]);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: 9999,
      compareAtPrice: 12999,
      costPrice: 6000,
      stock: 20,
      lowStockThreshold: 5,
      category: categories[0]?._id || '',
      images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      sku: `NEX-HW-${Date.now().toString(36).toUpperCase()}`,
      isFeatured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice || 0,
      costPrice: p.costPrice || 0,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold || 5,
      category: typeof p.category === 'object' ? p.category._id : p.category,
      images: p.images?.join(', ') || '',
      sku: p.sku || '',
      isFeatured: p.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        category: formData.category,
        images: formData.images.split(',').map((s) => s.trim()).filter(Boolean),
        sku: formData.sku,
        isFeatured: formData.isFeatured
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, payload);
        showToast('Product updated successfully! Cache invalidated.', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Product created successfully! Cache invalidated.', 'success');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted & cache cleared.', 'info');
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Hardware Inventory Registry</h1>
          <p className="text-xs text-lavender-grey mt-1">
            Create, update specs, manage stock thresholds, and invalidate caches
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-xs flex items-center gap-2 shadow-glow-purple self-start transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-slate/60 border border-white/5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-lavender-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, SKU, tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-dark-navy border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-lavender-grey/50 focus:outline-none focus:border-electric-purple"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-electric-purple"
          >
            <option value="all">All Sectors</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-dark-slate/60 border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-dark-slate border-b border-white/10 text-lavender-grey font-mono uppercase text-[10px]">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Sector</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-lavender-grey">
                    Querying MongoDB records...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-lavender-grey">
                    No products found in database.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.lowStockThreshold;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover bg-dark-navy shrink-0"
                        />
                        <div className="truncate max-w-xs">
                          <span className="font-semibold text-white block truncate">{p.title}</span>
                          <span className="text-[10px] text-lavender-grey/60 font-mono">ID: {p._id.slice(-6)}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-lavender-grey">
                        {typeof p.category === 'object' ? p.category.name : 'Sector'}
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-white">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-coral-red/20 text-coral-red">
                            Out of Stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-coral-red/20 text-coral-red flex items-center gap-1 w-max">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-mint-green/20 text-mint-green font-mono">
                            {p.stock} units
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-lavender-grey">{p.sku || 'N/A'}</td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.title)}
                          className="p-1.5 rounded-lg bg-coral-red/10 hover:bg-coral-red/20 text-coral-red"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl glass-panel border border-white/10 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-white">
                {editingProduct ? 'Modify Hardware Product' : 'Register New Hardware'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-lavender-grey hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-lavender-grey mb-1 font-medium">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1 font-medium">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Original / Compare Price</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: Number(e.target.value) })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Cost Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Live Stock Count *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Low Stock Threshold</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-lavender-grey mb-1 font-medium">Image URLs (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..., https://..."
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-lavender-grey mb-1 font-medium">Product SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-electric-purple"
                    />
                    <span>Featured Flagship Item</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-lavender-grey font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold shadow-glow-purple"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
