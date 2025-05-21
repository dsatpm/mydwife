'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isLoading, dbInitialized, isOnline, patientService, appointmentService } = useApp();
  const { isMidwife } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    appointmentsToday: 0,
    appointmentsWeek: 0
  });

  const isMidwifeUser = isMidwife();

  useEffect(() => {
    if (!dbInitialized) return;

    async function loadStats() {
      try {
        // Get all patients (midwife only)
        const patients = isMidwifeUser ? await patientService.getAll() : [];
        
        // Get all appointments
        const appointments = await appointmentService.getAll();
        
        // Calculate today's appointments
        const today = new Date().toISOString().split('T')[0];
        const appointmentsToday = appointments.filter(
          appointment => appointment.date.split('T')[0] === today
        ).length;
        
        // Calculate this week's appointments
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6));
        
        const appointmentsWeek = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
        }).length;
        
        setStats({
          patients: patients.length,
          appointmentsToday,
          appointmentsWeek
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    }
    
    loadStats();
  }, [dbInitialized, patientService, appointmentService, isMidwifeUser]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading application...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-4 max-w-lg mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-purple-800">Midwifery Dashboard</h1>
            <p className="text-gray-600">
              {isOnline ? 'Connected' : 'Working offline'}
            </p>
          </header>

          {/* Only show patient stats to midwives */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {isMidwifeUser && (
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-sm font-medium text-gray-500">Patients</h2>
                <p className="text-2xl font-bold text-purple-800">{stats.patients}</p>
              </div>
            )}
            <div className={`bg-white p-4 rounded-lg shadow ${!isMidwifeUser ? "col-span-2" : ""}`}>
              <h2 className="text-sm font-medium text-gray-500">Today's Appointments</h2>
              <p className="text-2xl font-bold text-purple-800">{stats.appointmentsToday}</p>
            </div>
          </div>

          {/* Quick Actions - Different for midwife vs client */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {isMidwifeUser ? (
                <>
                  <Link 
                    href="/patients/new" 
                    className="bg-purple-100 p-3 rounded-lg text-center text-purple-800 font-medium text-sm hover:bg-purple-200 transition-colors"
                  >
                    New Patient
                  </Link>
                  <Link 
                    href="/appointments/new" 
                    className="bg-purple-100 p-3 rounded-lg text-center text-purple-800 font-medium text-sm hover:bg-purple-200 transition-colors"
                  >
                    New Appointment
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/appointments" 
                    className="bg-purple-100 p-3 rounded-lg text-center text-purple-800 font-medium text-sm hover:bg-purple-200 transition-colors"
                  >
                    View Appointments
                  </Link>
                  <Link 
                    href="/health" 
                    className="bg-purple-100 p-3 rounded-lg text-center text-purple-800 font-medium text-sm hover:bg-purple-200 transition-colors"
                  >
                    Health Records
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">This Week</h2>
            </div>
            <div className="p-4">
              <p className="text-gray-600">You have <span className="font-bold text-purple-800">{stats.appointmentsWeek}</span> appointments this week.</p>
              <Link 
                href="/appointments" 
                className="mt-3 inline-block text-sm text-purple-600 hover:underline"
              >
                View Schedule →
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
