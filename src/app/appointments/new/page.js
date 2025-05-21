'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { useApp } from '../../../context/AppContext';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { appointmentService, patientService, dbInitialized } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: '60',
    type: 'Prenatal Check-up',
    location: '',
    notes: '',
  });

  // Appointment types for midwifery
  const appointmentTypes = [
    'Initial Consultation',
    'Prenatal Check-up',
    'Postnatal Visit',
    'Home Visit',
    'Birth Planning',
    'Newborn Check',
    'Lactation Support',
    'Other'
  ];

  // Load patients for dropdown
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Create appointment object
      const appointmentData = {
        patientId: parseInt(formData.patientId),
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        location: formData.location,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };
      
      // Save to IndexedDB
      await appointmentService.add(appointmentData);
      
      // Redirect to appointments list
      router.push('/appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-purple-800">Schedule New Appointment</h1>
        </header>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              {isLoadingPatients ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-purple-700 rounded-full"></div>
                  <span className="text-sm text-gray-500">Loading patients...</span>
                </div>
              ) : (
                <select
                  id="patientId"
                  name="patientId"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.patientId}
                  onChange={handleChange}
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <select
                id="duration"
                name="duration"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.duration}
                onChange={handleChange}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Type
              </label>
              <select
                id="type"
                name="type"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.type}
                onChange={handleChange}
              >
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.location}
                onChange={handleChange}
                placeholder="Clinic, Patient's home, etc."
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
