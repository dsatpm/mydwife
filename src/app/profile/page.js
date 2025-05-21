'use client';

import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../services/auth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state would go here in a real implementation
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const isMidwifeUser = user?.role === ROLES.MIDWIFE;
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 max-w-lg mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-purple-800">Your Profile</h1>
            <p className="text-gray-600">
              {isMidwifeUser ? 'Midwife Account' : 'Client Account'}
            </p>
          </header>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">Account Information</h2>
              <Link href="/profile/edit" className="text-sm text-purple-700 hover:underline">
                Edit Profile
              </Link>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium">{user?.name || 'Not provided'}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Account Type</p>
                <p className="font-medium">
                  {isMidwifeUser ? 'Midwife' : 'Client'}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Joined</p>
                <p className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {isMidwifeUser && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium">Midwife Settings</h2>
              </div>
              
              <div className="p-4">
                <p className="text-gray-600 mb-4">
                  Configure your profile and practice settings.
                </p>
                
                <button
                  onClick={() => {/* Would handle settings in a real application */}}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Manage Practice Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
