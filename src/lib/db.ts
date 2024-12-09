import { openDB, type DBSchema } from 'idb';
import type { QuizData } from '../types/quiz';
import type { Exercise } from '../types/exercise';
import type { DatabaseError } from '../types/errors';
import type { StudentProfile } from '../types/student';

interface MyDB extends DBSchema {
  students: {
    key: string;
    value: StudentProfile & { password: string };
    indexes: { 'by-email': string };
  };
  notifications: {
    key: string;
    value: {
      id: string;
      studentId: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      type: 'quiz' | 'exercise' | 'system';
    };
    indexes: { 'by-student': string };
  };
  messages: {
    key: string;
    value: {
      id: string;
      studentId: string;
      from: string;
      content: string;
      timestamp: string;
      read: boolean;
    };
    indexes: { 'by-student': string };
  };
  quizzes: {
    key: string;
    value: QuizData & {
      createdAt: string;
      updatedAt: string;
    };
  };
  exercises: {
    key: string;
    value: Exercise & {
      createdAt: string;
      updatedAt: string;
    };
  };
  progress: {
    key: string;
    value: {
      id: string;
      studentId: string;
      quizId?: string;
      quizTitle?: string;
      chapter?: string;
      exerciseId?: string;
      score: number;
      isComplete: boolean;
      answers: Record<string, string>;
      completedAt: string;
      timeSpent?: number;
      status?: 'in_progress' | 'completed';
      exerciseFeedback?: {
        questionId: string;
        subQuestionId?: string;
        difficulty: 'easy' | 'medium' | 'hard';
        timestamp: string;
        exerciseNumber?: number;
        questionNumber?: number;
      }[];
    };
    indexes: { 'by-student': string; 'by-quiz': string };
  };
}

const initDB = async () => {
  const db = await openDB<MyDB>('math-platform', 3, {
    upgrade(db, oldVersion, newVersion) {
      // Request persistent storage at start
      requestPersistentStorage();

      // Create initial stores
      if (!db.objectStoreNames.contains('students')) {
        // Create students store with email index
        const studentStore = db.createObjectStore('students', { keyPath: 'id' });
        studentStore.createIndex('by-email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('quizzes')) {
        db.createObjectStore('quizzes', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('exercises')) {
        db.createObjectStore('exercises', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('progress')) {
        const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
        progressStore.createIndex('by-student', 'studentId');
        progressStore.createIndex('by-quiz', 'quizId');
      }

      // Add notifications store
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notificationStore.createIndex('by-student', 'studentId');
      }
      
      // Add messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-student', 'studentId');
      }
    },
  });
  return db;
};

// Request persistent storage
async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
      
      if (!isPersisted) {
        console.warn('Persistent storage denied - data may be cleared by browser');
      }
    } catch (error) {
      console.error('Error requesting persistent storage:', error);
    }
  }
}
// Error handling wrapper
async function handleDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const dbError: DatabaseError = {
      code: 'DB_ERROR',
      message: error instanceof Error ? error.message : 'Database operation failed',
      timestamp: new Date().toISOString(),
    };
    console.error('Database error:', dbError);
    throw dbError;
  }
}

// Export a promise that resolves to the database instance
export const dbPromise = initDB();

// Helper functions to ensure we always wait for the DB to be ready
export const db = {
  async get(store: keyof MyDB, key: string) {
    return handleDbOperation(async () => {
      const database = await dbPromise;
      return database.get(store, key);
    });
  },

  async getAll(store: keyof MyDB) {
    return handleDbOperation(async () => {
      const database = await dbPromise;
      return database.getAll(store);
    });
  },

  async put(store: keyof MyDB, value: any) {
    return handleDbOperation(async () => {
      const database = await dbPromise;
      const tx = database.transaction(store, 'readwrite');
      await tx.store.put(value);
      await tx.done;
      return value;
    });
  },

  async delete(store: keyof MyDB, key: string) {
    return handleDbOperation(async () => {
      const database = await dbPromise;
      const tx = database.transaction(store, 'readwrite');
      await tx.store.delete(key);
      await tx.done;
    });
  },

  async getByIndex(store: 'students', indexName: 'by-email', key: string) {
    return handleDbOperation(async () => {
      const database = await dbPromise;
      return database.getFromIndex(store, indexName, key);
    });
  },

  async transaction<T>(stores: (keyof MyDB)[], callback: (tx: IDBTransaction) => Promise<T>): Promise<T> {
    return handleDbOperation(async () => {
      const database = await dbPromise;
      const tx = database.transaction(stores, 'readwrite');
      try {
        const result = await callback(tx);
        await tx.done;
        return result;
      } catch (error) {
        tx.abort();
        throw error;
      }
    });
  }
};