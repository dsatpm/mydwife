'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { getHealthRecordById, updateHealthRecord, getPatientById } from '@/services/db';

export default function EditHealthRecord() {
  const { id, recordId } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    summary: '',
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      weight: '',
      height: ''
    },
    measurements: ''
  });

  useEffect(() => {
    // Redirect non-midwives
    if (user && user.role !== 'MIDWIFE') {
      router.push('/unauthorized');
      return;
    }

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
        
        setPatient(patientData);

        // Format date for the input field
        const dateObj = new Date(recordData.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        setFormData({
          ...recordData,
          date: formattedDate,
          vitalSigns: recordData.vitalSigns || {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            respiratoryRate: '',
            weight: '',
            height: ''
          }
        });
      } catch (err) {
        console.error('Error fetching health record:', err);
        setError('Failed to load health record');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, recordId, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested object (vitalSigns)
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      await updateHealthRecord({
        ...formData,
        id: recordId,
        patientId: id,
        date: new Date(formData.date).toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: user.id
      });
      
      router.push(`/patients/${id}/health/${recordId}`);
    } catch (err) {
      console.error('Error updating health record:', err);
      setError('Failed to update health record. Please try again.');
      setSaving(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Edit Health Record</h1>
      </div>

      {patient && (
        <div className="mb-4 bg-gray-100 p-3 rounded">
          <p className="text-sm text-gray-700">
            Patient: <span className="font-medium">{patient.firstName} {patient.lastName}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Record Type *
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Check-up">Check-up</option>
              <option value="Prenatal">Prenatal Visit</option>
              <option value="Postnatal">Postnatal Visit</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Lab Results">Lab Results</option>
              <option value="Birth">Birth</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date *
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="summary">
            Summary *
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="summary"
            type="text"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Brief summary of this health record"
            required
          />
        </div>
        
        <div className="mb-6">
          <h3 className="text-gray-700 text-md font-bold mb-3">Vital Signs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitalSigns.bloodPressure">
                Blood Pressure
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="vitalSigns.bloodPressure"
                type="text"
                name="vitalSigns.bloodPressure"
                value={formData.vitalSigns.bloodPressure}
                onChange={handleChange}
                placeholder="e.g. 120/80"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitalSigns.heartRate">
                Heart Rate
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="vitalSigns.heartRate"
                type="text"
                name="vitalSigns.heartRate"
                value={formData.vitalSigns.heartRate}
                onChange={handleChange}
                placeholder="e.g. 72 bpm"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitalSigns.temperature">
                Temperature
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="vitalSigns.temperature"
                type="text"
                name="vitalSigns.temperature"
                value={formData.vitalSigns.temperature}
                onChange={handleChange}
                placeholder="e.g. 98.6°F"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitalSigns.respiratoryRate">
                Respiratory Rate
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="vitalSigns.respiratoryRate"
                type="text"
                name="vitalSigns.respiratoryRate"
                value={formData.vitalSigns.respiratoryRate}
                onChange={handleChange}
                placeholder="e.g. 16 breaths/min"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitalSigns.weight">
                Weight
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="vitalSigns.weight"
                type="text"
                name="vitalSigns.weight"
                value={formData.vitalSigns.weight}
                onChange={handleChange}
                placeholder="e.g. 150 lbs"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitalSigns.height">
                Height
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="vitalSigns.height"
                type="text"
                name="vitalSigns.height"
                value={formData.vitalSigns.height}
                onChange={handleChange}
                placeholder="e.g. 5'6\""
              />
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="measurements">
            Additional Measurements
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="measurements"
            type="text"
            name="measurements"
            value={formData.measurements || ''}
            onChange={handleChange}
            placeholder="Fundal height, fetal heart rate, etc."
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Detailed Notes
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows="5"
            placeholder="Enter detailed observations, recommendations, and care plan"
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
