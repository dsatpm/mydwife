'use client';

import { useApp } from '../context/AppContext';

export default function NetworkStatus() {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 dark:bg-amber-600 text-white p-2 text-center text-sm z-50">
      You are currently offline. Changes will be saved and synced when you reconnect.
    </div>
  );
}
