import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { api } from '../../api/client';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: 'Sparkles',
    isActive: true
  });
  const { showToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories?includeInactive=true');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      icon: 'Cpu',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
      icon: c.icon || 'Cpu',
      isActive: c.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, formData);
        showToast('Sector category updated', 'success');
      } else {
        await api.post('/categories', formData);
        showToast('Sector category created', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted', 'info');
      fetchCategories();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-white">Hardware Sectors</h1>
          <p className="text-xs text-lavender-grey mt-1">Manage categories and sector taxonomy</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-xs flex items-center gap-2 shadow-glow-purple transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Sector</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c._id}
            className="p-6 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-neon-lime uppercase">
                {c.productCount || 0} Products
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c._id, c.name)}
                  className="p-1.5 rounded-lg bg-coral-red/10 hover:bg-coral-red/20 text-coral-red"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-white">{c.name}</h3>
              <p className="text-xs font-mono text-lavender-grey/60 mt-0.5">/{c.slug}</p>
              <p className="text-xs text-lavender-grey mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-base text-white">
                {editingCategory ? 'Edit Sector' : 'Create Sector'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-lavender-grey hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-lavender-grey mb-1">Sector Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="auto-generated from name"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-lavender-grey font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-electric-purple text-white font-bold"
                >
                  Save Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
