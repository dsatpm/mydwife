'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';
import { getAppointmentById, getPatientById, updateAppointment, deleteAppointment } from '@/services/db';
import Link from 'next/link';

export default function AppointmentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    type: '',
    notes: '',
    location: '',
    status: 'scheduled'
  });

  useEffect(() => {
    // For clients, check if this is their appointment
    const checkAccess = async (appt) => {
      if (user.role === 'CLIENT') {
        const patientData = await getPatientById(appt.patientId);
        if (patientData.userId !== user.id) {
          router.push('/unauthorized');
          return false;
        }
      }
      return true;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the appointment
        const apptData = await getAppointmentById(id);
        if (!apptData) {
          setError('Appointment not found');
          setLoading(false);
          return;
        }

        // Check access rights
        const hasAccess = await checkAccess(apptData);
        if (!hasAccess) return;

        setAppointment(apptData);
        
        // Fetch patient information
        if (apptData.patientId) {
          const patientData = await getPatientById(apptData.patientId);
          setPatient(patientData);
        }

        // Format date and time for form
        const dateObj = new Date(apptData.dateTime);
        const formattedDate = dateObj.toISOString().split('T')[0];
        const formattedTime = dateObj.toTimeString().slice(0, 5); // HH:MM format
        
        setFormData({
          date: formattedDate,
          time: formattedTime,
          duration: apptData.duration || 60,
          type: apptData.type || '',
          notes: apptData.notes || '',
          location: apptData.location || '',
          status: apptData.status || 'scheduled'
        });
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment information');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProcessing(true);
      
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      await updateAppointment({
        ...appointment,
        dateTime: dateTime.toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        notes: formData.notes,
        location: formData.location,
        status: formData.status,
        updatedAt: new Date().toISOString()
      });
      
      // Refresh appointment data
      const updatedAppointment = await getAppointmentById(id);
      setAppointment(updatedAppointment);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    
    try {
      setProcessing(true);
      await deleteAppointment(id);
      router.push('/appointments');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Failed to delete appointment. Please try again.');
      setProcessing(false);
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
            <p className="text-lg">Loading appointment information...</p>
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
          onClick={() => router.push('/appointments')} 
          className="text-blue-500 hover:text-blue-700"
        >
          ← Back to Appointments
        </button>
        {!isEditing && user.role === 'MIDWIFE' && (
          <div>
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Edit
            </button>
            <button 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              disabled={processing}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {appointment && (
        <div className="bg-white shadow rounded-lg p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold mb-4">Edit Appointment</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                    Time *
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                    Appointment Type *
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a type</option>
                    <option value="Initial Consultation">Initial Consultation</option>
                    <option value="Prenatal Checkup">Prenatal Checkup</option>
                    <option value="Postnatal Checkup">Postnatal Checkup</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="Birth Plan Discussion">Birth Plan Discussion</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                    Duration (minutes) *
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Location
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Office, Home Visit, Virtual, etc."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Status *
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Additional notes or instructions for this appointment"
                ></textarea>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    type="submit"
                    disabled={processing}
                  >
                    {processing ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <div className="border-b pb-4 mb-4">
                <div className={`inline-block px-2 py-1 rounded text-sm font-semibold text-white mb-2 ${
                  appointment.status === 'completed' ? 'bg-green-500' :
                  appointment.status === 'cancelled' ? 'bg-red-500' :
                  appointment.status === 'confirmed' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </div>
                <h1 className="text-2xl font-bold">{appointment.type}</h1>
                <p className="text-gray-600">
                  {new Date(appointment.dateTime).toLocaleDateString()} at {new Date(appointment.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
                <p className="text-gray-600">Duration: {appointment.duration} minutes</p>
              </div>

              {patient && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Patient</h2>
                  <Link href={`/patients/${patient.id}`} className="text-blue-500 hover:text-blue-700">
                    {patient.firstName} {patient.lastName}
                  </Link>
                  <p className="text-gray-600">{patient.phone}</p>
                </div>
              )}

              {appointment.location && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Location</h2>
                  <p>{appointment.location}</p>
                </div>
              )}

              {appointment.notes && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Notes</h2>
                  <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                    {appointment.notes}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-6">
                <p>Created: {new Date(appointment.createdAt).toLocaleString()}</p>
                {appointment.updatedAt && <p>Last Updated: {new Date(appointment.updatedAt).toLocaleString()}</p>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
