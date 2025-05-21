'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function MidwifeRoute({ children }) {
  const router = useRouter();
  const { isMidwife, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isMidwife()) {
      router.push('/unauthorized');
    }
  }, [isMidwife, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isMidwife()) {
    return null;
  }

  return children;
}
