'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { getPatientById, getHealthRecordsForPatient } from '@/services/db';
import Link from 'next/link';

export default function PatientDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect non-midwives
    if (user && user.role !== 'MIDWIFE') {
      router.push('/unauthorized');
      return;
    }

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientData = await getPatientById(id);
        if (!patientData) {
          setError('Patient not found');
          setLoading(false);
          return;
        }

        setPatient(patientData);

        const records = await getHealthRecordsForPatient(id);
        setHealthRecords(records);
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Failed to load patient information');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPatientData();
    }
  }, [id, user, router]);

  if (!user) {
    return null; // Will be redirected by ProtectedRoute
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="animate-pulse text-center">
            <p className="text-lg">Loading patient information...</p>
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
          ← Back to Patients
        </button>
        <Link 
          href={`/patients/${id}/edit`}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Edit Patient
        </Link>
      </div>

      {patient && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{patient.firstName} {patient.lastName}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
              <p><span className="font-medium">Date of Birth:</span> {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              <p><span className="font-medium">Phone:</span> {patient.phone}</p>
              <p><span className="font-medium">Email:</span> {patient.email || 'Not provided'}</p>
              <p><span className="font-medium">Address:</span> {patient.address || 'Not provided'}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Medical Information</h2>
              <p><span className="font-medium">Blood Type:</span> {patient.bloodType || 'Unknown'}</p>
              <p><span className="font-medium">Allergies:</span> {patient.allergies || 'None'}</p>
              <p><span className="font-medium">Medical History:</span> {patient.medicalHistory || 'None recorded'}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Health Records</h2>
              <Link 
                href={`/patients/${id}/health/new`}
                className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded"
              >
                Add Health Record
              </Link>
            </div>
            
            {healthRecords.length === 0 ? (
              <p className="text-gray-500 mt-4">No health records found for this patient.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Type</th>
                      <th className="py-2 px-4 border-b text-left">Summary</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="py-2 px-4 border-b">{new Date(record.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4 border-b">{record.type}</td>
                        <td className="py-2 px-4 border-b">{record.summary}</td>
                        <td className="py-2 px-4 border-b">
                          <Link 
                            href={`/patients/${id}/health/${record.id}`}
                            className="text-blue-500 hover:text-blue-700 mr-2"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <Link 
                href={`/appointments/new?patientId=${id}`}
                className="bg-green-500 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded"
              >
                Schedule Appointment
              </Link>
            </div>
            
            <p className="text-gray-500 mt-4">Appointments feature coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}
