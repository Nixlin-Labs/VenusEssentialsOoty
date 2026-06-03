import "./globals.css";
import { Toaster } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

export const metadata = {
  title: "Venus Essentials — Admin Panel",
  description: "Admin panel for Venus Essentials ecommerce platform",
};

export default function AdminRootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <ConfirmModal />
      </body>
    </html>
  );
}
