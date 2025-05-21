import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'midwiferyDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  PATIENTS: 'patients',
  APPOINTMENTS: 'appointments',
  HEALTH_RECORDS: 'healthRecords',
  SYNC_QUEUE: 'syncQueue',
  USERS: 'users',
};

// Initialize the database
export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
        const patientStore = db.createObjectStore(STORES.PATIENTS, { keyPath: 'id', autoIncrement: true });
        patientStore.createIndex('name', 'name');
        patientStore.createIndex('dueDate', 'dueDate');
      }

      if (!db.objectStoreNames.contains(STORES.APPOINTMENTS)) {
        const appointmentStore = db.createObjectStore(STORES.APPOINTMENTS, { keyPath: 'id', autoIncrement: true });
        appointmentStore.createIndex('patientId', 'patientId');
        appointmentStore.createIndex('date', 'date');
      }

      if (!db.objectStoreNames.contains(STORES.HEALTH_RECORDS)) {
        const healthRecordStore = db.createObjectStore(STORES.HEALTH_RECORDS, { keyPath: 'id', autoIncrement: true });
        healthRecordStore.createIndex('patientId', 'patientId');
        healthRecordStore.createIndex('date', 'date');
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('role', 'role');
      }
    }
  });

  return db;
};

// Patient CRUD operations
export const patientService = {
  async getAll() {
    const db = await initDB();
    return db.getAll(STORES.PATIENTS);
  },

  async getById(id) {
    const db = await initDB();
    return db.get(STORES.PATIENTS, id);
  },

  async add(patient) {
    const db = await initDB();
    const id = await db.add(STORES.PATIENTS, patient);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'patient',
      action: 'add',
      data: { ...patient, id }
    });
    
    return id;
  },

  async update(patient) {
    const db = await initDB();
    await db.put(STORES.PATIENTS, patient);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'patient',
      action: 'update',
      data: patient
    });
    
    return patient.id;
  },

  async delete(id) {
    const db = await initDB();
    await db.delete(STORES.PATIENTS, id);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'patient',
      action: 'delete',
      data: { id }
    });
  }
};

// Appointment CRUD operations
export const appointmentService = {
  async getAll() {
    const db = await initDB();
    return db.getAll(STORES.APPOINTMENTS);
  },

  async getByPatientId(patientId) {
    const db = await initDB();
    const tx = db.transaction(STORES.APPOINTMENTS, 'readonly');
    const index = tx.store.index('patientId');
    return index.getAll(patientId);
  },

  async add(appointment) {
    const db = await initDB();
    const id = await db.add(STORES.APPOINTMENTS, appointment);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'appointment',
      action: 'add',
      data: { ...appointment, id }
    });
    
    return id;
  },

  async update(appointment) {
    const db = await initDB();
    await db.put(STORES.APPOINTMENTS, appointment);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'appointment',
      action: 'update',
      data: appointment
    });
    
    return appointment.id;
  },

  async delete(id) {
    const db = await initDB();
    await db.delete(STORES.APPOINTMENTS, id);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'appointment',
      action: 'delete',
      data: { id }
    });
  }
};

// Health Record CRUD operations
export const healthRecordService = {
  async getAll() {
    const db = await initDB();
    return db.getAll(STORES.HEALTH_RECORDS);
  },

  async getByPatientId(patientId) {
    const db = await initDB();
    const tx = db.transaction(STORES.HEALTH_RECORDS, 'readonly');
    const index = tx.store.index('patientId');
    return index.getAll(patientId);
  },

  async add(record) {
    const db = await initDB();
    const id = await db.add(STORES.HEALTH_RECORDS, record);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'healthRecord',
      action: 'add',
      data: { ...record, id }
    });
    
    return id;
  },

  async update(record) {
    const db = await initDB();
    await db.put(STORES.HEALTH_RECORDS, record);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'healthRecord',
      action: 'update',
      data: record
    });
    
    return record.id;
  },

  async delete(id) {
    const db = await initDB();
    await db.delete(STORES.HEALTH_RECORDS, id);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'healthRecord',
      action: 'delete',
      data: { id }
    });
  }
};

// Sync queue operations
export const syncQueueService = {
  async getAll() {
    const db = await initDB();
    return db.getAll(STORES.SYNC_QUEUE);
  },
  
  async add(item) {
    const db = await initDB();
    return db.add(STORES.SYNC_QUEUE, item);
  },
  
  async delete(id) {
    const db = await initDB();
    return db.delete(STORES.SYNC_QUEUE, id);
  },
  
  async clear() {
    const db = await initDB();
    const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }
};

// Helper function to add items to sync queue
async function addToSyncQueue(item) {
  if (navigator.onLine) {
    // TODO: Implement server sync logic here
    // For now, we just add to queue
    await syncQueueService.add({
      ...item,
      timestamp: new Date().toISOString()
    });
  } else {
    await syncQueueService.add({
      ...item,
      timestamp: new Date().toISOString()
    });
  }
}

// Export stores for use in components
export { STORES };

// User CRUD operations
export const userService = {
  async getAll() {
    const db = await initDB();
    return db.getAll(STORES.USERS);
  },

  async getById(id) {
    const db = await initDB();
    return db.get(STORES.USERS, id);
  },

  async getByEmail(email) {
    const db = await initDB();
    const tx = db.transaction(STORES.USERS, 'readonly');
    const index = tx.store.index('email');
    return index.get(email);
  },

  async add(user) {
    const db = await initDB();
    const id = await db.add(STORES.USERS, user);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'user',
      action: 'add',
      data: { ...user, id }
    });
    
    return id;
  },

  async update(user) {
    const db = await initDB();
    await db.put(STORES.USERS, user);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'user',
      action: 'update',
      data: user
    });
    
    return user.id;
  },

  async delete(id) {
    const db = await initDB();
    await db.delete(STORES.USERS, id);
    
    // Add to sync queue when online
    await addToSyncQueue({
      type: 'user',
      action: 'delete',
      data: { id }
    });
  }
};

// New specific functions needed for the patient detail pages
export const getPatientById = async (id) => {
  return await patientService.getById(id);
};

export const updatePatient = async (patient) => {
  return await patientService.update(patient);
};

export const getHealthRecordsForPatient = async (patientId) => {
  return await healthRecordService.getByPatientId(patientId);
};

export const getHealthRecordById = async (id) => {
  const db = await initDB();
  return db.get(STORES.HEALTH_RECORDS, id);
};

export const addHealthRecord = async (record) => {
  return await healthRecordService.add(record);
};

export const updateHealthRecord = async (record) => {
  return await healthRecordService.update(record);
};

export const deleteHealthRecord = async (id) => {
  return await healthRecordService.delete(id);
};

export const getAppointmentById = async (id) => {
  const db = await initDB();
  return db.get(STORES.APPOINTMENTS, id);
};

export const updateAppointment = async (appointment) => {
  return await appointmentService.update(appointment);
};

export const deleteAppointment = async (id) => {
  return await appointmentService.delete(id);
};
