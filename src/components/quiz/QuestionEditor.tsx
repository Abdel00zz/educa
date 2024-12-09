import React from 'react';
import { Trash2, Plus, Minus, X, Check } from 'lucide-react';
import { MathInput } from './MathInput';
import type { Question, QuestionType } from '../../types/quiz';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Choix Multiple' },
  { value: 'truefalse', label: 'Vrai/Faux' },
  { value: 'fillblank', label: 'Texte à Trous' }
];

interface QuestionEditorProps {
  question: Question;
  questionNumber: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  error?: string;
}

export function QuestionEditor({ 
  question, 
  questionNumber,
  onUpdate, 
  onDelete,
  error 
}: QuestionEditorProps) {
  const handleTypeChange = (type: QuestionType) => {
    onUpdate({
      ...question,
      type,
      answer: type === 'mcq' ? '' : type === 'fillblank' ? [] : '',
      options: type === 'mcq' ? [''] : undefined,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    if (!question.options) return;
    onUpdate({
      ...question,
      options: [...question.options, '']
    });
  };

  const removeOption = (index: number) => {
    if (!question.options) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    const newAnswer = Array.isArray(question.answer) 
      ? question.answer.filter(ans => ans !== question.options?.[index])
      : question.answer;
    onUpdate({
      ...question,
      options: newOptions,
      answer: newAnswer
    });
  };

  const toggleAnswer = (option: string) => {
    onUpdate({ ...question, answer: option });
  };

  return (
    <div className={`border rounded-lg p-4 ${error ? 'border-red-300 bg-red-50' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-lg font-medium text-gray-700">
              Question {questionNumber}
            </span>
            <select
              value={question.type}
              onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {QUESTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
              title="Delete question"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <MathInput
                value={question.text}
                onChange={(value) => {
                  onUpdate({ ...question, text: value });
                }}
                placeholder="Enter question text (use $ $ for math expressions)"
              />
              {question.type === 'fillblank' && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Réponses Attendues</h4>
                  <div className="space-y-4">
                    {(question.text.match(/\[(.*?)\]/g) || []).map((blank, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Trou {index + 1}:</span>
                        <input
                          type="text"
                          value={Array.isArray(question.answer) ? question.answer[index] || '' : ''}
                          onChange={(e) => {
                            const newAnswers = Array.isArray(question.answer) 
                              ? [...question.answer] 
                              : [];
                            newAnswers[index] = e.target.value;
                            onUpdate({ ...question, answer: newAnswers });
                          }}
                          className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Réponse pour le trou ${index + 1}`}
                        />
                      </div>
                    ))}
                    {(question.text.match(/\[(.*?)\]/g) || []).length === 0 && (
                      <p className="text-sm text-gray-500">
                        Utilisez des crochets [ ] pour définir les trous. Exemple: "La somme de 2 et 3 est [5]"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {question.type === 'mcq' && question.options && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  <button
                    onClick={addOption}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter Option
                  </button>
                </div>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <div className="mt-2">
                        <button
                          onClick={() => toggleAnswer(option)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            question.answer === option 
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          {question.answer === option && <Check className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex-1">
                        <MathInput
                          value={option}
                          onChange={(value) => handleOptionChange(index, value)}
                          placeholder={`Réponse ${index + 1}`}
                        />
                      </div>
                      <button
                        onClick={() => removeOption(index)}
                        className="mt-2 p-1 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                        title="Supprimer l'option"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Sélectionnez la réponse correcte
                </p>
              </div>
            )}

            {question.type === 'truefalse' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réponse correcte
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={question.answer === 'true'}
                      onChange={() => onUpdate({ ...question, answer: 'true' })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Vrai</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={question.answer === 'false'}
                      onChange={() => onUpdate({ ...question, answer: 'false' })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2">Faux</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}