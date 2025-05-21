import { syncQueueService } from './db';

// Network status tracking
export const networkService = {
  // Initialize network status tracking
  init(callback) {
    // Set initial online status
    this.isOnline = navigator.onLine;
    
    // Add event listeners for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      if (callback) callback(true);
      this.syncData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      if (callback) callback(false);
    });
    
    // Return current online status
    return this.isOnline;
  },
  
  // Check if currently online
  checkOnline() {
    return navigator.onLine;
  },
  
  // Sync data when back online
  async syncData() {
    if (!navigator.onLine) return;
    
    try {
      // Get all items in sync queue
      const queueItems = await syncQueueService.getAll();
      
      if (queueItems.length === 0) return;
      
      console.log('Syncing data with server...', queueItems);
      
      // TODO: Implement actual server sync
      // For now, we'll just simulate a successful sync by clearing the queue
      
      // In a real implementation, you would:
      // 1. Loop through queue items
      // 2. Send each item to the server
      // 3. Remove from queue when successfully synced
      
      // For demo purposes, just clear the queue after a delay
      setTimeout(async () => {
        await syncQueueService.clear();
        console.log('Sync completed successfully');
      }, 2000);
    } catch (error) {
      console.error('Error syncing data:', error);
    }
  }
};
