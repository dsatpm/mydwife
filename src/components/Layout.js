'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NetworkStatus from './NetworkStatus';
import ServiceWorkerHandler from './ServiceWorkerHandler';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMidwife, isClient, logout } = useAuth();

  // Navigation items for midwife
  const midwifeNavItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Patients', href: '/patients' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Profile', href: '/profile' },
  ];

  // Navigation items for client
  const clientNavItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Health', href: '/health' },
    { name: 'Profile', href: '/profile' },
  ];

  // Use appropriate nav items based on user role
  const navItems = isMidwife() ? midwifeNavItems : clientNavItems;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Network status notification */}
      <NetworkStatus />
      
      {/* Service Worker update notification */}
      <ServiceWorkerHandler />
      
      {/* Top header with user info */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-purple-800">Midwifery App</h1>
          {user && (
            <div className="flex items-center">
              <span className="text-gray-600 text-sm mr-3">
                {user.name || user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm text-purple-700 hover:text-purple-900"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow pb-16">
        {children}
      </main>
      
      {/* Bottom navigation for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = 
              (item.href === '/' && pathname === '/') || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  isActive ? 'text-purple-700' : 'text-gray-600'
                }`}
              >
                {/* Icon placeholder - replace with actual icons in your implementation */}
                <div className={`h-6 w-6 mb-1 ${isActive ? 'bg-purple-700' : 'bg-gray-400'} rounded-full opacity-80`}></div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
