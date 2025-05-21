'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import MidwifeRoute from '../../components/auth/MidwifeRoute';
import { useApp } from '../../context/AppContext';

export default function PatientsPage() {
  const { patientService, dbInitialized, isLoading } = useApp();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  useEffect(() => {
    if (!dbInitialized) return;

    async function loadPatients() {
      try {
        const allPatients = await patientService.getAll();
        setPatients(allPatients);
        setIsLoadingPatients(false);
      } catch (error) {
        console.error('Error loading patients:', error);
        setIsLoadingPatients(false);
      }
    }

    loadPatients();
  }, [dbInitialized, patientService]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <MidwifeRoute>
        <Layout>
          <div className="p-4 max-w-lg mx-auto">
            <header className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-purple-800">Patients</h1>
              <Link 
                href="/patients/new" 
                className="bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors"
              >
                Add New
              </Link>
            </header>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  {/* Search icon placeholder */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
              </div>
            </div>

            {isLoadingPatients ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">No patients found.</p>
                <Link 
                  href="/patients/new" 
                  className="text-purple-700 hover:underline"
                >
                  Add your first patient
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <ul className="divide-y divide-gray-200">
                  {filteredPatients.map(patient => (
                    <li key={patient.id}>
                      <Link href={`/patients/${patient.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            {patient.dueDate && (
                              <p className="text-sm text-gray-500">
                                Due: {new Date(patient.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {patient.phone || patient.email}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Layout>
      </MidwifeRoute>
    </ProtectedRoute>
  );
}
