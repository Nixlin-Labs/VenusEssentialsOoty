'use client';

import { useEffect, useState } from 'react';
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
  FiDownload
} from 'react-icons/fi';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/products', label: 'Products', icon: <FiBox /> },
  { href: '/categories', label: 'Categories', icon: <FiFolder /> },
  { href: '/inventory', label: 'Inventory', icon: <FiLayers /> },
  { href: '/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { href: '/customers', label: 'Customers', icon: <FiUsers /> },
  { href: '/coupons', label: 'Coupons', icon: <FiTag /> },
  { href: '/reviews', label: 'Reviews', icon: <FiStar /> },
  { href: '/testimonials', label: 'Testimonials', icon: <FiMessageSquare /> },
  { href: '/subscribers', label: 'Subscribers', icon: <FiMail /> },
  { href: '/enquiries', label: 'Enquiries', icon: <FiMessageCircle /> },
  { href: '/cms', label: 'CMS Pages', icon: <FiFileText /> },
  { href: '/banners', label: 'Banners', icon: <FiImage /> },
  { href: '/reports', label: 'Reports', icon: <FiBarChart2 /> },
  { href: '/settings', label: 'Settings', icon: <FiSettings /> },
  { href: '/example-export', label: 'Demo Exports', icon: <FiDownload /> },
];

export default function DashboardLayout({ children }) {
  const { user, isAuthenticated, logout } = useAdminAuthStore();
  const confirm = useConfirmStore((state) => state.confirm);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
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

  if (!mounted || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-surface border-r border-border flex-shrink-0 transition-all duration-300 fixed inset-y-0 left-0 z-30`} id="admin-sidebar">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
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
        <nav className="p-2 space-y-0.5 overflow-y-auto" style={{ height: 'calc(100vh - 8rem)' }}>
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
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-surface">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-forest-800 text-xs font-bold">{user?.name?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-900 truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-lg text-error hover:text-red-700 cursor-pointer p-1 rounded hover:bg-charcoal-50 transition-colors" 
                title="Logout"
              >
                <FiLogOut />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout} 
              className="w-full flex justify-center text-lg text-error cursor-pointer p-1 rounded hover:bg-charcoal-50 transition-colors" 
              title="Logout"
            >
              <FiLogOut />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-charcoal-900 capitalize">
            {pathname === '/' ? 'Dashboard' : pathname.split('/')[1]?.replace(/-/g, ' ')}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
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
