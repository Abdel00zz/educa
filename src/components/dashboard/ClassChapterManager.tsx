import React, { useState } from 'react';
import { Plus, X, Edit2, Save, AlertCircle } from 'lucide-react';
import { useClassChapter } from '../../contexts/ClassChapterContext';

interface ClassChapterManagerProps {
  onClose: () => void;
}

interface ChaptersByClass {
  [className: string]: string[];
}

export function ClassChapterManager({ onClose }: ClassChapterManagerProps) {
  const { classes, chapters, updateClasses, updateChapters } = useClassChapter();
  const [tempClasses, setTempClasses] = useState([...classes]);
  const [tempChapters, setTempChapters] = useState<ChaptersByClass>(() => {
    const initial: ChaptersByClass = {};
    classes.forEach(cls => {
      initial[cls] = chapters.filter(ch => ch.startsWith(`${cls}:`)).map(ch => ch.split(':')[1]);
    });
    return initial;
  });
  const [newClass, setNewClass] = useState('');
  const [newChapter, setNewChapter] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || '');
  const [editingClass, setEditingClass] = useState<{ index: number; value: string } | null>(null);
  const [editingChapter, setEditingChapter] = useState<{ index: number; value: string } | null>(null);

  const handleAddClass = () => {
    if (!newClass.trim()) return;
    if (tempClasses.includes(newClass.trim())) {
      alert('Cette classe existe déjà');
      return;
    }
    const newClassValue = newClass.trim();
    setTempClasses([...tempClasses, newClassValue]);
    setTempChapters(prev => ({ ...prev, [newClassValue]: [] }));
    setSelectedClass(newClassValue);
    setNewClass('');
  };

  const handleAddChapter = () => {
    if (!newChapter.trim()) return;
    if (tempChapters[selectedClass]?.includes(newChapter.trim())) {
      alert('Ce chapitre existe déjà');
      return;
    }
    setTempChapters(prev => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), newChapter.trim()]
    }));
    setNewChapter('');
  };

  const handleDeleteClass = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      const classToDelete = tempClasses[index];
      const newClasses = tempClasses.filter((_, i) => i !== index);
      setTempClasses(newClasses);
      setTempChapters(prev => {
        const { [classToDelete]: _, ...rest } = prev;
        return rest;
      });
      setSelectedClass(newClasses[0] || '');
    }
  };

  const handleDeleteChapter = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
      setTempChapters(prev => ({
        ...prev,
        [selectedClass]: prev[selectedClass].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveClassEdit = () => {
    if (!editingClass) return;
    const newClasses = [...tempClasses];
    const oldClass = newClasses[editingClass.index];
    newClasses[editingClass.index] = editingClass.value;
    setTempClasses(newClasses);
    setTempChapters(prev => {
      const { [oldClass]: chapters, ...rest } = prev;
      return { ...rest, [editingClass.value]: chapters || [] };
    });
    setEditingClass(null);
  };

  const handleSaveChapterEdit = () => {
    if (!editingChapter) return;
    setTempChapters(prev => ({
      ...prev,
      [selectedClass]: prev[selectedClass].map((ch, i) => 
        i === editingChapter.index ? editingChapter.value : ch
      )
    }));
    setEditingChapter(null);
  };

  const handleSave = () => {
    // Convert chapter structure back to flat array with class prefixes
    const flatChapters = Object.entries(tempChapters).flatMap(([cls, chapters]) =>
      chapters.map(ch => `${cls}:${ch}`)
    );
    updateClasses(tempClasses);
    updateChapters(flatChapters);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestion des Classes et Chapitres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Classes Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Classes</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  placeholder="Nouvelle classe"
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAddClass}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {tempClasses.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    {editingClass?.index === index ? (
                      <input
                        type="text"
                        value={editingClass.value}
                        onChange={(e) => setEditingClass({ index, value: e.target.value })}
                        className="flex-1 px-2 py-1 border rounded-md mr-2"
                        autoFocus
                      />
                    ) : (
                      <span>{cls}</span>
                    )}
                    <div className="flex gap-2">
                      {editingClass?.index === index ? (
                        <button
                          onClick={handleSaveClassEdit}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingClass({ index, value: cls })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClass(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chapters Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Chapitres</h3>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="ml-4 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                {tempClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder={`Nouveau chapitre pour ${selectedClass}`}
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  disabled={!selectedClass}
                />
                <button
                  onClick={handleAddChapter}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedClass}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {selectedClass && tempChapters[selectedClass]?.map((chapter, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    {editingChapter?.index === index ? (
                      <input
                        type="text"
                        value={editingChapter.value}
                        onChange={(e) => setEditingChapter({ index, value: e.target.value })}
                        className="flex-1 px-2 py-1 border rounded-md mr-2"
                        autoFocus
                      />
                    ) : (
                      <span>{chapter}</span>
                    )}
                    <div className="flex gap-2">
                      {editingChapter?.index === index ? (
                        <button
                          onClick={handleSaveChapterEdit}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingChapter({ index, value: chapter })}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteChapter(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-700">
              Les modifications seront appliquées aux nouveaux exercices et quiz.
            </p>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}