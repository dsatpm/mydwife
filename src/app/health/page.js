'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function HealthPage() {
  const { healthRecordService, patientService, dbInitialized } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);

  useEffect(() => {
    if (!dbInitialized || !user) return;

    async function loadData() {
      try {
        // In a real application, you would link a user to a patient record
        // Here, we're simulating this by finding a patient with a matching email
        const allPatients = await patientService.getAll();
        const matchingPatient = allPatients.find(p => p.email === user.email);
        
        if (matchingPatient) {
          setPatient(matchingPatient);
          
          // Get health records for this patient
          const records = await healthRecordService.getByPatientId(matchingPatient.id);
          setHealthRecords(records);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading health data:', error);
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [dbInitialized, user, patientService, healthRecordService]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 max-w-lg mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-purple-800">Your Health Records</h1>
            <p className="text-gray-600">
              View your health information
            </p>
          </header>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your health records...</p>
            </div>
          ) : !patient ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600 mb-4">
                No patient record is linked to your account yet.
              </p>
              <p className="text-gray-500 text-sm">
                Please contact your midwife to set up your patient record.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Patient Information</h2>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  
                  {patient.dateOfBirth && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {patient.dueDate && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Due Date</p>
                      <p className="font-medium">
                        {new Date(patient.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-medium">Health Records</h2>
                </div>
                
                {healthRecords.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">No health records found.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {healthRecords.map(record => (
                      <li key={record.id}>
                        <Link href={`/patients/${patient.id}/health/${record.id}`} className="block p-4 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-900">
                              {record.type || 'Health Record'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                          
                          {record.summary && (
                            <p className="mt-1 text-sm text-gray-600">{record.summary}</p>
                          )}
                          
                          {record.measurements && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-700">Measurements:</p>
                              <ul className="ml-4 mt-1 space-y-1">
                                {Object.entries(record.measurements).map(([key, value]) => (
                                  <li key={key} className="text-sm">
                                    <span className="text-gray-600">{key}:</span> {value}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="mt-2 text-right">
                            <span className="text-purple-600 text-sm">View details →</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
