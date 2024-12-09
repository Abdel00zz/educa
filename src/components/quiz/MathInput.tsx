import React, { useState, useEffect } from 'react';
import { MathJax } from 'better-react-mathjax';
import { Eye, Edit2 } from 'lucide-react';
import { validateMathExpression } from '../../lib/mathUtils';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
}

export function MathInput({ 
  value, 
  onChange, 
  placeholder,
  minRows = 3,
  maxRows = 6 
}: MathInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    try {
      setLocalValue(newValue);
      
      // Extract and validate math expressions
      const mathExpressions = newValue.match(/\$(.*?[^\\])\$/g) || [];
      for (const expr of mathExpressions) {
        const mathContent = expr.slice(1, -1);
        if (!validateMathExpression(mathContent)) {
          throw new Error('Invalid LaTeX syntax');
        }
      }
      setError(null);
      onChange(newValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid math expression');
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Only update parent if validation passes
    if (!error) {
      onChange(localValue);
    }
  };

  const renderPreview = () => {
    try {
      const parts = value.split(/(\$.*?[^\\]\$)/g);
      return parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const mathContent = part.slice(1, -1);
          return (
            <span key={i} className="inline-block px-1">
              <MathJax inline>{`\\(${mathContent}\\)`}</MathJax>
            </span>
          );
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      });
    } catch {
      return value;
    }
  };

  const calculateRows = (text: string) => {
    const lineCount = (text.match(/\n/g) || []).length + 1;
    return Math.min(Math.max(lineCount, minRows), maxRows);
  };

  return (
    <div className="relative">
      {isEditing ? (
        <div className="relative">
          <textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 font-mono"
            rows={calculateRows(localValue)}
            autoFocus
          />
          <button
            onClick={handleBlur}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="group w-full p-2 border rounded-md min-h-[4rem] cursor-text hover:bg-gray-50 prose relative"
        >
          {value ? renderPreview() : <span className="text-gray-400">{placeholder}</span>}
          <button
            className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-opacity"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1 flex items-center justify-between">
        <span>Use $ $ to wrap mathematical expressions (e.g., $x^2 + 2x + 1$)</span>
        {value && !isEditing && (
          <span className="text-gray-400">
            Click to edit
          </span>
        )}
      </p>
    </div>
  );
}