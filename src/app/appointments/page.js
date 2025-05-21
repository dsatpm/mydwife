'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function AppointmentsPage() {
  const { appointmentService, patientService, dbInitialized, isLoading } = useApp();
  const { user, isMidwife } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isMidwifeUser = isMidwife();

  useEffect(() => {
    if (!dbInitialized || !user) return;

    async function loadData() {
      try {
        let allAppointments = [];
        
        if (isMidwifeUser) {
          // Midwives see all appointments
          allAppointments = await appointmentService.getAll();
        } else {
          // Clients only see their own appointments
          // In a real app, you'd have a proper linking between users and patients
          // Here we're using a simple email match for demonstration
          const allPatients = await patientService.getAll();
          const matchingPatient = allPatients.find(p => p.email === user.email);
          
          if (matchingPatient) {
            // Get appointments for this patient only
            allAppointments = await appointmentService.getByPatientId(matchingPatient.id);
          }
        }
        
        setAppointments(allAppointments);
        
        // Load all patients and convert to a map for easy lookup
        const allPatients = await patientService.getAll();
        const patientMap = {};
        allPatients.forEach(patient => {
          patientMap[patient.id] = patient;
        });
        setPatients(patientMap);
        
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading appointments data:', error);
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [dbInitialized, appointmentService, patientService, user, isMidwifeUser]);

  // Filter appointments based on selected date
  const filteredAppointments = appointments.filter(appointment => 
    appointment.date.split('T')[0] === selectedDate
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700 dark:border-purple-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading appointments...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 max-w-lg mx-auto">
          <header className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-800 dark:text-purple-400">Appointments</h1>
            {isMidwifeUser && (
              <Link 
                href="/appointments/new" 
                className="bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-800 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                New Appointment
              </Link>
            )}
          </header>

          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {isLoadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-700 dark:border-purple-400 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No appointments scheduled for this date.</p>
              {isMidwifeUser && (
                <Link 
                  href="/appointments/new" 
                  className="text-purple-700 dark:text-purple-400 hover:underline"
                >
                  Schedule an appointment
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppointments.map(appointment => {
                  const patient = patients[appointment.patientId];
                  const appointmentTime = new Date(appointment.date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <li key={appointment.id}>
                      <Link href={`/appointments/${appointment.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="px-4 py-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {appointmentTime}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {patient ? patient.name : 'Unknown Patient'}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {appointment.type || 'General Visit'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
