import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  Package,
  LogOut,
  Github
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  onOpenAiCopilot: () => void;
  onOpenGithub: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAiCopilot, onOpenGithub }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-electric-purple/20 border border-electric-purple/40 flex items-center justify-center group-hover:scale-105 group-hover:shadow-glow-purple transition-all duration-300">
            <Sparkles className="w-5 h-5 text-neon-lime" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-2xl tracking-wider text-white">NEXORA</span>
              <span className="w-2 h-2 rounded-full bg-neon-lime animate-pulse"></span>
            </div>
            <span className="text-[10px] tracking-widest text-lavender-grey uppercase font-mono -mt-1 block">
              Scalable Tech
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/shop" className="text-sm font-medium text-lavender-grey hover:text-white transition-colors">
            Shop Catalog
          </Link>
          <Link to="/categories" className="text-sm font-medium text-lavender-grey hover:text-white transition-colors">
            Categories
          </Link>
          {user && (
            <Link to="/orders" className="text-sm font-medium text-lavender-grey hover:text-white transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative max-w-xs w-full">
          <Search className="w-4 h-4 text-lavender-grey absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search futuristic gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-slate/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-lavender-grey/60 focus:outline-none focus:border-electric-purple focus:ring-1 focus:ring-electric-purple transition-all"
          />
        </form>

        {/* Actions (AI Copilot, GitHub, Cart, User) */}
        <div className="flex items-center gap-3">
          {/* AI Copilot Button */}
          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-electric-purple/15 hover:bg-electric-purple/25 border border-electric-purple/40 text-xs font-semibold text-white transition-all hover:shadow-glow-purple group"
            title="Ask Nexora AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-neon-lime group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* GitHub Repo Button */}
          <button
            onClick={onOpenGithub}
            className="p-2.5 rounded-xl bg-dark-slate hover:bg-white/10 border border-white/5 text-lavender-grey hover:text-white transition-colors"
            title="Architecture & GitHub API"
          >
            <Github className="w-4 h-4" />
          </button>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-dark-slate hover:bg-white/10 border border-white/5 text-lavender-grey hover:text-white transition-all"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-neon-lime text-dark-navy text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-glow-lime">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Admin Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl bg-dark-slate hover:bg-white/10 border border-white/5 transition-all"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-electric-purple flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-white max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-lavender-grey truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neon-lime/20 text-neon-lime uppercase">
                        Admin Role
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neon-lime hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-neon-lime" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-lavender-grey hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-lavender-grey hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    My Orders
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-coral-red hover:bg-coral-red/10 rounded-xl transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-lavender-grey hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-electric-purple hover:bg-electric-purple/90 text-xs font-bold text-white shadow-glow-purple transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-dark-slate text-lavender-grey hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/10 bg-dark-navy/95 backdrop-blur-2xl">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-slate border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white"
            />
          </form>
          <div className="flex flex-col gap-3">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-lavender-grey hover:text-white"
            >
              Shop Catalog
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-lavender-grey hover:text-white"
            >
              Categories
            </Link>
            {user && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-lavender-grey hover:text-white"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-neon-lime"
              >
                Admin Management Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
