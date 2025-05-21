'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { getHealthRecordById, getPatientById } from '@/services/db';
import Link from 'next/link';

export default function HealthRecordDetail() {
  const { id, recordId } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [healthRecord, setHealthRecord] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For clients, check if this is their record
    const checkAccess = async (patientData, recordData) => {
      if (user.role === 'CLIENT' && patientData.userId !== user.id) {
        router.push('/unauthorized');
        return false;
      }
      return true;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the health record
        const recordData = await getHealthRecordById(recordId);
        if (!recordData) {
          setError('Health record not found');
          setLoading(false);
          return;
        }

        // Make sure the record belongs to the patient
        if (recordData.patientId !== id) {
          setError('Record does not match patient');
          setLoading(false);
          return;
        }

        // Fetch the patient information
        const patientData = await getPatientById(id);
        if (!patientData) {
          setError('Patient not found');
          setLoading(false);
          return;
        }

        // Check access rights
        const hasAccess = await checkAccess(patientData, recordData);
        if (!hasAccess) return;

        setHealthRecord(recordData);
        setPatient(patientData);
      } catch (err) {
        console.error('Error fetching health record:', err);
        setError('Failed to load health record information');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, recordId, user, router]);

  if (!user) {
    return null; // Will be redirected by ProtectedRoute
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="animate-pulse text-center">
            <p className="text-lg">Loading health record...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button 
          onClick={() => router.back()} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => router.back()} 
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back
        </button>
        {user.role === 'MIDWIFE' && (
          <Link 
            href={`/patients/${id}/health/${recordId}/edit`}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Edit Record
          </Link>
        )}
      </div>

      {healthRecord && patient && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="border-b pb-4 mb-4">
            <p className="text-sm text-gray-500">
              {new Date(healthRecord.date).toLocaleDateString()} - {healthRecord.type}
            </p>
            <h1 className="text-2xl font-bold mb-2">{healthRecord.summary}</h1>
            {user.role === 'MIDWIFE' && (
              <p className="text-gray-700">
                Patient: <Link href={`/patients/${id}`} className="text-blue-500 hover:text-blue-700">
                  {patient.firstName} {patient.lastName}
                </Link>
              </p>
            )}
          </div>

          {healthRecord.vitalSigns && Object.values(healthRecord.vitalSigns).some(v => v) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Vital Signs</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {healthRecord.vitalSigns.bloodPressure && (
                  <div>
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <p className="font-medium">{healthRecord.vitalSigns.bloodPressure}</p>
                  </div>
                )}
                
                {healthRecord.vitalSigns.heartRate && (
                  <div>
                    <p className="text-sm text-gray-500">Heart Rate</p>
                    <p className="font-medium">{healthRecord.vitalSigns.heartRate}</p>
                  </div>
                )}
                
                {healthRecord.vitalSigns.temperature && (
                  <div>
                    <p className="text-sm text-gray-500">Temperature</p>
                    <p className="font-medium">{healthRecord.vitalSigns.temperature}</p>
                  </div>
                )}
                
                {healthRecord.vitalSigns.respiratoryRate && (
                  <div>
                    <p className="text-sm text-gray-500">Respiratory Rate</p>
                    <p className="font-medium">{healthRecord.vitalSigns.respiratoryRate}</p>
                  </div>
                )}
                
                {healthRecord.vitalSigns.weight && (
                  <div>
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="font-medium">{healthRecord.vitalSigns.weight}</p>
                  </div>
                )}
                
                {healthRecord.vitalSigns.height && (
                  <div>
                    <p className="text-sm text-gray-500">Height</p>
                    <p className="font-medium">{healthRecord.vitalSigns.height}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {healthRecord.measurements && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Additional Measurements</h2>
              <p>{healthRecord.measurements}</p>
            </div>
          )}
          
          {healthRecord.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {healthRecord.notes}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-6">
            <p>Record created: {new Date(healthRecord.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
