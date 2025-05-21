'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '../services/serviceWorkerRegistration';

export default function ServiceWorkerHandler() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-purple-800 text-white p-4 flex items-center justify-between z-50">
      <p className="text-sm">A new version is available!</p>
      <button 
        onClick={updateServiceWorker}
        className="px-4 py-2 bg-white text-purple-800 rounded-md text-sm font-medium"
      >
        Update
      </button>
    </div>
  );
}
