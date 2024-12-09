import { db, dbPromise } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types/messages';

export async function sendMessages(messages: Array<{ studentId: string; content: string }>) {
  try {
    const database = await dbPromise;
    const tx = database.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    
    await Promise.all(messages.map(msg => store.put({
      id: uuidv4(),
      studentId: msg.studentId,
      from: 'Admin',
      content: msg.content,
      timestamp: new Date().toISOString(),
      read: false,
    })));
    
    await tx.done;
  } catch (error) {
    console.error('Error sending messages:', error);
    throw error;
  }
}

export async function getMessages(studentId: string): Promise<Message[]> {
  try {
    const database = await dbPromise;
    const tx = database.transaction('messages', 'readonly');
    const store = tx.objectStore('messages');
    const index = store.index('by-student');
    return await index.getAll(studentId);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function sendMessage(studentId: string, data: Omit<Message, 'id' | 'timestamp' | 'read'>) {
  const message = {
    id: uuidv4(),
    ...data,
    studentId,
    timestamp: new Date().toISOString(),
    read: false,
  };

  await db.put('messages', message);
  return message;
}

export async function markMessageAsRead(id: string) {
  const message = await db.get('messages', id);
  if (message) {
    message.read = true;
    await db.put('messages', message);
  }
  return message;
}

export function formatMessageWithLinks(text: string): string {
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  
  // Replace URLs with clickable links
  return text.replace(urlPattern, (url) => {
    // Extract display text if provided in format [text](url)
    const mdLinkMatch = url.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (mdLinkMatch) {
      const [_, text, link] = mdLinkMatch;
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 hover:underline">${text}</a>`;
    }
    
    // Regular URL
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 hover:underline">${url}</a>`;
  });
}