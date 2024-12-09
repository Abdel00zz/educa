import React from 'react';
import { X } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';
import type { QuizData } from '../../types/quiz';

interface QuizPreviewProps {
  quiz: QuizData;
  onClose: () => void;
}

export function QuizPreview({ quiz, onClose }: QuizPreviewProps) {
  const renderText = (text: string) => {
    const parts = text.split(/(\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return <MathJax key={i} inline>{`\\(${mathContent}\\)`}</MathJax>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quiz Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold">{quiz.title}</h3>
          <p className="text-gray-600">
            {quiz.gradeLevel} - {quiz.chapter}
          </p>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="border-b pb-4">
              <p className="font-medium mb-3">
                {index + 1}. {renderText(question.text)}
              </p>

              {question.type === 'mcq' && question.options && (
                <div className="ml-4 space-y-2">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        disabled
                        className="h-4 w-4 text-indigo-600"
                      />
                      <span>{renderText(option)}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'truefalse' && (
                <div className="ml-4 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="true"
                      disabled
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2">True</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value="false"
                      disabled
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2">False</span>
                  </label>
                </div>
              )}

              {question.type === 'fillblank' && (
                <div className="ml-4">
                  {question.text.split(/(\[.*?\])/g).map((part, i) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                      return (
                        <input
                          key={i}
                          type="text"
                          disabled
                          placeholder="Your answer"
                          className="mx-1 w-24 px-2 py-1 border border-gray-300 rounded-md text-center bg-gray-50"
                        />
                      );
                    }
                    return <span key={i}>{renderText(part)}</span>;
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}