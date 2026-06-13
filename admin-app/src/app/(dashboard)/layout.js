'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useAdminAuthStore from '@/store/useAdminAuthStore';
import useConfirmStore from '@/store/useConfirmStore';
import FileViewerModal from '@/components/FileViewerModal';
import {
  FiGrid,
  FiBox,
  FiFolder,
  FiLayers,
  FiShoppingCart,
  FiUsers,
  FiTag,
  FiStar,
  FiMessageSquare,
  FiMail,
  FiMessageCircle,
  FiFileText,
  FiImage,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiDownload,
  FiCreditCard
} from 'react-icons/fi';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/products', label: 'Products', icon: <FiBox /> },
  { href: '/categories', label: 'Categories', icon: <FiFolder /> },
  { href: '/inventory', label: 'Inventory', icon: <FiLayers /> },
  { href: '/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { href: '/payments', label: 'Payments', icon: <FiCreditCard /> },
  { href: '/customers', label: 'Customers', icon: <FiUsers /> },
  { href: '/coupons', label: 'Coupons', icon: <FiTag /> },
  { href: '/reviews', label: 'Reviews', icon: <FiStar /> },
  { href: '/testimonials', label: 'Testimonials', icon: <FiMessageSquare /> },
  { href: '/subscribers', label: 'Subscribers', icon: <FiMail /> },
  { href: '/enquiries', label: 'Enquiries', icon: <FiMessageCircle /> },
  { href: '/banners', label: 'Banners', icon: <FiImage /> },
  { href: '/reports', label: 'Reports', icon: <FiBarChart2 /> },
  { href: '/settings', label: 'Settings', icon: <FiSettings /> },
  // { href: '/example-export', label: 'Demo Exports', icon: <FiDownload /> },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const getAvatarUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url}`;
};

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, logout } = useAdminAuthStore();
  const confirm = useConfirmStore((state) => state.confirm);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileMenuRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const close = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileOpen]);

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of the Venus Admin Panel?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (confirmed) {
      logout();
    }
  };

  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || 'A';
  const userAvatar = getAvatarUrl(user?.avatar || '');

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-surface border-r border-border flex-shrink-0 transition-all duration-300 fixed inset-y-0 left-0 z-30`} id="admin-sidebar">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-forest-800" style={{ fontFamily: 'Georgia, serif' }}>Venus Admin</h1>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="admin-btn admin-btn-secondary p-1.5 cursor-pointer"
            title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {sidebarOpen ? <FiChevronLeft className="text-sm" /> : <FiChevronRight className="text-sm" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="p-2 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-800'
                    : 'text-charcoal-500 hover:bg-charcoal-50 hover:text-charcoal-900'
                }`}
              >
                <span className="flex-shrink-0 text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b bg-surface border-border">
          <h2 className="text-lg font-semibold capitalize text-charcoal-900">
            {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]?.replace(/-/g, ' ')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded  px-2 py-1.5 text-sm hover:bg-charcoal-50"
                aria-label="Open profile menu"
              >
                <span className="flex items-center justify-center w-8 h-8 overflow-hidden text-xs font-bold rounded-full bg-forest-100 text-forest-800">
                  {userAvatar ? <Image src={userAvatar} alt="" width={32} height={32} className="object-cover w-full h-full" /> : userInitial}
                </span>
                <span className="hidden font-medium text-left truncate max-w-36 text-charcoal-900 sm:block">{user?.name}</span>
                <FiChevronDown className={`text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 z-40 w-56 py-1 bg-white border rounded shadow-lg top-12 border-border">
                  {/* <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold truncate text-charcoal-900">{user?.name}</p>
                    <p className="text-xs truncate text-muted">{user?.email}</p>
                    <p className="mt-1 text-xs capitalize text-muted">{user?.role?.replace('_', ' ')}</p>
                  </div> */}
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-4 text-sm text-charcoal-700 hover:bg-charcoal-50"
                  >
                    <FiUser size={14} /> Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full gap-2 px-4 py-4 text-sm text-left text-error hover:bg-charcoal-50"
                  >
                    <FiLogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
      <FileViewerModal />
    </div>
  );
}
