import React, { createContext, useContext, useState, useEffect } from 'react';

interface ClassChapterContextType {
  classes: string[];
  chapters: string[];
  updateClasses: (newClasses: string[]) => void;
  updateChapters: (newChapters: string[]) => void;
}

const defaultClasses = ['TRC', '1BAC', '2BAC'];
const defaultChapters = ['Ordre dans R', 'Trigonometrie', 'Droite'];

const ClassChapterContext = createContext<ClassChapterContextType>({
  classes: defaultClasses,
  chapters: defaultChapters,
  updateClasses: () => {},
  updateChapters: () => {},
});

export function ClassChapterProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<string[]>(() => {
    const stored = localStorage.getItem('mathPlatform.classes');
    return stored ? JSON.parse(stored) : defaultClasses;
  });

  const [chapters, setChapters] = useState<string[]>(() => {
    const stored = localStorage.getItem('mathPlatform.chapters');
    return stored ? JSON.parse(stored) : defaultChapters;
  });

  useEffect(() => {
    localStorage.setItem('mathPlatform.classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('mathPlatform.chapters', JSON.stringify(chapters));
  }, [chapters]);

  const updateClasses = (newClasses: string[]) => {
    setClasses(newClasses);
  };

  const updateChapters = (newChapters: string[]) => {
    setChapters(newChapters);
  };

  return (
    <ClassChapterContext.Provider value={{ classes, chapters, updateClasses, updateChapters }}>
      {children}
    </ClassChapterContext.Provider>
  );
}

export function useClassChapter() {
  const context = useContext(ClassChapterContext);
  if (!context) {
    throw new Error('useClassChapter must be used within a ClassChapterProvider');
  }
  return context;
}