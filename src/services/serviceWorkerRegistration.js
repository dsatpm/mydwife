'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

export function useServiceWorker() {
  const [registration, setRegistration] = useState(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      // Register the service worker
      const wb = new Workbox('/service-worker.js');
      
      // New service worker waiting event
      wb.addEventListener('waiting', () => {
        setIsUpdateAvailable(true);
      });
      
      // Register the service worker after the window loads
      wb.register()
        .then(reg => {
          console.log('Service Worker registered successfully!');
          setRegistration(reg);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Function to update the service worker
  const updateServiceWorker = () => {
    if (!registration || !registration.waiting) return;
    
    // Send a message to the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to activate the new service worker
    window.location.reload();
    setIsUpdateAvailable(false);
  };

  return { registration, isUpdateAvailable, updateServiceWorker };
}
