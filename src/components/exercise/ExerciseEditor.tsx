import React, { useState, useEffect } from 'react';
import { Save, Eye, Plus, PlusCircle, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MathInput } from '../quiz/MathInput';
import { ExercisePreview } from './ExercisePreview';
import { createExercise, updateExercise } from '../../lib/exercise';
import { useClassChapter } from '../../contexts/ClassChapterContext';
import type { Exercise, Question, SubQuestion } from '../../types/exercise';

interface ExerciseEditorProps {
  initialData?: Exercise;
  onClose: () => void;
}

export function ExerciseEditor({ initialData, onClose }: ExerciseEditorProps) {
  const { classes, chapters } = useClassChapter();
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [exercise, setExercise] = useState<Exercise>(() => initialData || {
    id: uuidv4(),
    gradeLevel: '',
    chapter: '',
    statement: '',
    questions: [],
  });

  useEffect(() => {
    if (exercise.gradeLevel) {
      const classChapters = chapters
        .filter(ch => ch.startsWith(`${exercise.gradeLevel}:`))
        .map(ch => ch.split(':')[1]);
      setAvailableChapters(classChapters);
      if (!classChapters.includes(exercise.chapter)) {
        setExercise(prev => ({ ...prev, chapter: '' }));
      }
    } else {
      setAvailableChapters([]);
    }
  }, [exercise.gradeLevel, chapters]);

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!exercise.gradeLevel || !exercise.chapter) {
      alert('Please fill in all required fields');
      return;
    }

    if (exercise.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      setSaving(true);
      if (initialData) {
        await updateExercise(exercise);
      } else {
        await createExercise(exercise);
      }
      onClose();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Error saving exercise. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      number: exercise.questions.length + 1,
      text: '',
      subQuestions: [],
    };
    setExercise({
      ...exercise,
      questions: [...exercise.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setExercise({
      ...exercise,
      questions: exercise.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const addSubQuestion = (questionId: string) => {
    const newSubQuestion: SubQuestion = {
      id: uuidv4(),
      label: String.fromCharCode(97 + exercise.questions.find(q => q.id === questionId)?.subQuestions.length || 0),
      text: '',
    };
    
    setExercise({
      ...exercise,
      questions: exercise.questions.map(q =>
        q.id === questionId
          ? { ...q, subQuestions: [...q.subQuestions, newSubQuestion] }
          : q
      ),
    });
  };

  const updateSubQuestion = (questionId: string, subQuestionId: string, updates: Partial<SubQuestion>) => {
    setExercise({
      ...exercise,
      questions: exercise.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: q.subQuestions.map(sq =>
                sq.id === subQuestionId ? { ...sq, ...updates } : sq
              ),
            }
          : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    setExercise({
      ...exercise,
      questions: exercise.questions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, number: index + 1 })),
    });
  };

  const deleteSubQuestion = (questionId: string, subQuestionId: string) => {
    setExercise({
      ...exercise,
      questions: exercise.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              subQuestions: q.subQuestions
                .filter(sq => sq.id !== subQuestionId)
                .map((sq, index) => ({
                  ...sq,
                  label: String.fromCharCode(97 + index),
                })),
            }
          : q
      ),
    });
  };

  if (showPreview) {
    return (
      <ExercisePreview
        exercise={exercise}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Modifier l\'exercice' : 'Créer un nouvel exercice'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Edit Exercise' : 'Create New Exercise'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Grade Level
              </label>
              <select
                value={exercise.gradeLevel}
                onChange={(e) => setExercise({ ...exercise, gradeLevel: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Grade Level</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chapitre*
              </label>
              <select 
                value={exercise.chapter} 
                onChange={(e) => setExercise({ ...exercise, chapter: e.target.value })} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!exercise.gradeLevel}
              >
                <option value="">
                  {exercise.gradeLevel 
                    ? 'Sélectionner le chapitre' 
                    : 'Sélectionnez d\'abord une classe'}
                </option>
                {availableChapters.map(chapter => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Statement (Optional)
            </label>
            <MathInput
              value={exercise.statement}
              onChange={(value) => setExercise({ ...exercise, statement: value })}
              placeholder="Enter exercise statement (use $ $ for math expressions)"
            />
          </div>

          <div className="space-y-4">
            {exercise.questions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question {question.number}
                    </label>
                    <MathInput
                      value={question.text}
                      onChange={(value) => updateQuestion(question.id, { text: value })}
                      placeholder="Enter question text"
                    />
                  </div>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="text-red-600 hover:text-red-700 ml-4"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="ml-6 space-y-3">
                  {question.subQuestions.map((subQ) => (
                    <div key={subQ.id} className="flex items-start gap-4">
                      <span className="text-sm font-medium text-gray-500 mt-2">
                        {subQ.label})
                      </span>
                      <div className="flex-1">
                        <MathInput
                          value={subQ.text}
                          onChange={(value) =>
                            updateSubQuestion(question.id, subQ.id, { text: value })
                          }
                          placeholder="Enter sub-question text"
                        />
                      </div>
                      <button
                        onClick={() => deleteSubQuestion(question.id, subQ.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addSubQuestion(question.id)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Sub-Question
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addQuestion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </button>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Exercise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}