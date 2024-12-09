import React, { useState, useEffect, useCallback } from 'react';
import { Save, Eye, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { QuestionEditor } from './QuestionEditor';
import { QuizPreview } from './QuizPreview';
import { createQuiz, updateQuiz } from '../../lib/quiz';
import { validateQuiz } from '../../lib/validation';
import { useClassChapter } from '../../contexts/ClassChapterContext';
import type { QuizData, QuizFormData, Question } from '../../types/quiz';
import type { QuizEditorProps } from '../../types/quiz';

export function QuizEditor({ onClose, initialData }: QuizEditorProps) {
  const { classes, chapters } = useClassChapter();
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [formData, setFormData] = useState<QuizFormData>(() => ({
    title: '',
    gradeLevel: '',
    chapter: '', 
    ...initialData
  }));
  const [questions, setQuestions] = useState<Question[]>(() => 
    initialData?.questions || []
  );

  useEffect(() => {
    if (formData.gradeLevel) {
      const classChapters = chapters
        .filter(ch => ch.startsWith(`${formData.gradeLevel}:`))
        .map(ch => ch.split(':')[1]);
      setAvailableChapters(classChapters);
      if (!classChapters.includes(formData.chapter)) {
        setFormData(prev => ({ ...prev, chapter: '' }));
      }
    } else {
      setAvailableChapters([]);
    }
  }, [formData.gradeLevel, chapters]);

  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) newErrors.title = 'Le titre est requis';
    if (!formData.gradeLevel) newErrors.gradeLevel = 'Le niveau est requis';
    if (!formData.chapter?.trim()) newErrors.chapter = 'Le chapitre est requis';
    if (questions.length === 0) newErrors.questions = 'Ajoutez au moins une question';
    
    questions.forEach((q, idx) => {
      if (!q.text?.trim()) {
        newErrors[`question-${idx}`] = 'Le texte de la question est requis';
      }
      if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
        newErrors[`question-${idx}-options`] = 'Ajoutez au moins 2 options';
      }
      if (!q.answer) {
        newErrors[`question-${idx}-answer`] = 'La réponse est requise';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, questions]);

  const handleSave = async () => {
    try {
      if (!validateForm()) return;
      
      setSaving(true);
      setErrors({});
      
      const quizData = {
        id: initialData?.id || uuidv4(),
        ...formData,
        questions,
      };
      
      validateQuiz(quizData);
      
      if (initialData) {
        await updateQuiz(quizData);
      } else {
        await createQuiz(quizData);
      }
      
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ submit: error.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: keyof QuizFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: 'mcq',
      text: '',
      answer: '',
      options: ['', '', '', ''],
    };
    setQuestions([...questions, newQuestion]);
    if (errors.questions) {
      setErrors(prev => ({ ...prev, questions: '' }));
    }
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
    // Clear any errors for the updated question
    const questionIdx = questions.findIndex(q => q.id === updatedQuestion.id);
    if (questionIdx !== -1) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`question-${questionIdx}`];
        delete newErrors[`question-${questionIdx}-options`];
        delete newErrors[`question-${questionIdx}-answer`];
        return newErrors;
      });
    }
  };

  if (showPreview) {
    return (
      <QuizPreview
        quiz={{ ...formData, id: '', questions }}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Modifier le Quiz' : 'Créer un Nouveau Quiz'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Titre*
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Niveau*
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => handleFormChange('gradeLevel', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.gradeLevel ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Sélectionner le niveau</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              {errors.gradeLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.gradeLevel}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chapitre*
              </label>
              <select 
                value={formData.chapter} 
                onChange={(e) => handleFormChange('chapter', e.target.value)} 
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.chapter ? 'border-red-300' : 'border-gray-300'
                }`} 
                disabled={!formData.gradeLevel}
                required
              >
                <option value="">
                  {formData.gradeLevel 
                    ? 'Sélectionner le chapitre' 
                    : 'Sélectionnez d\'abord une classe'}
                </option>
                {availableChapters.map(chapter => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
              {errors.chapter && (
                <p className="mt-1 text-sm text-red-600">{errors.chapter}</p>
              )}
            </div>
          </div>

          {errors.questions && questions.length === 0 && (
            <p className="text-sm text-red-600">{errors.questions}</p>
          )}

          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id}
                question={question}
                questionNumber={index + 1}
                onUpdate={handleQuestionUpdate}
                onDelete={() => setQuestions(questions.filter(q => q.id !== question.id))}
                error={errors[`question-${index}`] || errors[`question-${index}-options`] || errors[`question-${index}-answer`]}
              />
            ))}
          </div>

          <button
            onClick={handleAddQuestion}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une Question
          </button>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}