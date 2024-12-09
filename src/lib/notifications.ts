import { db, dbPromise } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Notification } from '../types/notifications';

export async function getNotifications(studentId: string): Promise<Notification[]> {
  try {
    const database = await dbPromise;
    const tx = database.transaction('notifications', 'readonly');
    const store = tx.objectStore('notifications');
    const index = store.index('by-student');
    return await index.getAll(studentId);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function createNotification(studentId: string, data: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const notification = {
    id: uuidv4(),
    ...data,
    studentId,
    timestamp: new Date().toISOString(),
    read: false,
  };

  await db.put('notifications', notification);
  return notification;
}

export async function markNotificationAsRead(id: string) {
  const notification = await db.get('notifications', id);
  if (notification) {
    notification.read = true;
    await db.put('notifications', notification);
  }
  return notification;
}

export async function deleteNotification(id: string) {
  await db.delete('notifications', id);
}