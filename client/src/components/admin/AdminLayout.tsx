import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  ShoppingBag,
  Boxes,
  Users,
  CreditCard,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout, isLoading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-navy text-white text-xs">
        Verifying Administrative Access...
      </div>
    );
  }

  // Role-based protection: only admin allowed
  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-navy text-white flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-slate border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-lime" />
          <span className="font-display font-extrabold text-lg text-white">NEXORA ADMIN</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-dark-navy text-lavender-grey"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-[#0E0E18] border-r border-white/5 flex flex-col justify-between p-5 transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between px-2">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center shadow-glow-purple">
                <Sparkles className="w-5 h-5 text-neon-lime" />
              </div>
              <div>
                <span className="font-display font-extrabold text-lg tracking-wider text-white">NEXORA</span>
                <span className="text-[10px] text-neon-lime font-mono block -mt-1 font-bold">ADMIN SUITE</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-electric-purple text-white shadow-glow-purple font-bold'
                      : 'text-lavender-grey hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-neon-lime' : 'text-lavender-grey'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-dark-slate/60 hover:bg-dark-slate text-lavender-grey hover:text-white transition-colors"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-coral-red hover:bg-coral-red/10 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
