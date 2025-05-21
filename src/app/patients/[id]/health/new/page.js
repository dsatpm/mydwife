'use client';

import { useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { addHealthRecord } from '@/services/db';

export default function NewHealthRecord() {
  const { id } = useParams(); // Patient ID
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Check-up',
    date: new Date().toISOString().split('T')[0],
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
      
      // Create health record with patient ID
      await addHealthRecord({
        ...formData,
        patientId: id,
        date: new Date(formData.date).toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: user.id
      });
      
      router.push(`/patients/${id}`);
    } catch (err) {
      console.error('Error creating health record:', err);
      setError('Failed to create health record. Please try again.');
      setSaving(false);
    }
  };

  // Redirect if user is not a midwife
  if (user && user.role !== 'MIDWIFE') {
    router.push('/unauthorized');
    return null;
  }

  if (!user) {
    return null; // Will be redirected by ProtectedRoute
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
        <h1 className="text-2xl font-bold">New Health Record</h1>
      </div>

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
                placeholder="e.g. 5'6\"
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
            value={formData.measurements}
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
            value={formData.notes}
            onChange={handleChange}
            rows="5"
            placeholder="Enter detailed observations, recommendations, and care plan"
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Create Health Record'}
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
