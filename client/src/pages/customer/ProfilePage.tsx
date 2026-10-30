import React, { useState } from 'react';
import { User, MapPin, Plus, Check, Shield, Lock, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import { Address } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // New address state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.patch('/auth/profile', { name, phone });
      updateUser(res.data.data);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/addresses', newAddress);
      updateUser({ addresses: res.data.data });
      showToast('Address saved successfully!', 'success');
      setShowAddressModal(false);
      setNewAddress({
        fullName: user.name,
        phone: user.phone || '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Account Control</h1>
        <p className="text-xs text-lavender-grey mt-1">Manage profile coordinates, addresses, and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Profile Form */}
        <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-electric-purple/30 border border-electric-purple/50 flex items-center justify-center text-lg font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-display font-bold text-lg text-white">{user.name}</h2>
              <span className="text-xs text-lavender-grey block">{user.email}</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neon-lime/20 text-neon-lime uppercase font-mono">
                {user.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-lavender-grey mb-1.5 font-medium">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
              />
            </div>

            <div>
              <label className="block text-lavender-grey mb-1.5 font-medium">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-dark-navy/50 border border-white/5 rounded-xl px-4 py-2.5 text-lavender-grey/60 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-lavender-grey mb-1.5 font-medium">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-navy border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-purple"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-3 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-purple transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Right: Saved Addresses */}
        <div className="md:col-span-6 p-6 sm:p-8 rounded-3xl bg-dark-slate/60 border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-display font-bold text-base text-white">
              <MapPin className="w-4 h-4 text-neon-lime" />
              <span>Shipping Addresses</span>
            </div>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-3">
            {(!user.addresses || user.addresses.length === 0) ? (
              <p className="text-xs text-lavender-grey text-center py-8">
                No saved addresses. Add an address for seamless 1-click checkout.
              </p>
            ) : (
              user.addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-dark-navy/80 border border-white/5 text-xs space-y-1 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-neon-lime/20 text-neon-lime font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-lavender-grey">{addr.street}</p>
                  <p className="text-lavender-grey">
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="text-lavender-grey/80 font-mono text-[11px] pt-1">Phone: {addr.phone}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-white/10 p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-white">Add Shipping Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-lavender-grey mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-lavender-grey mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-lavender-grey mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lavender-grey mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="w-full bg-dark-navy border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-lavender-grey font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-electric-purple text-white font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
