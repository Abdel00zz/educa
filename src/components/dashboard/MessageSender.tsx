import React, { useState } from 'react';
import { Send, Users, X } from 'lucide-react';
import { sendMessages } from '../../lib/messages';
import type { Student } from '../../types';

interface MessageSenderProps {
  students: Student[];
  onClose: () => void;
}

export function MessageSender({ students, onClose }: MessageSenderProps) {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const filteredStudents = selectedClass
    ? students.filter(s => s.gradeLevel === selectedClass)
    : students;

  const classes = Array.from(new Set(students.map(s => s.gradeLevel))).sort();

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSend = async () => {
    if (!message.trim() || selectedStudents.length === 0) return;

    try {
      setSending(true);
      await sendMessages(
        selectedStudents.map(studentId => ({
          studentId,
          content: message,
        }))
      );
      onClose();
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('Une erreur est survenue lors de l\'envoi des messages');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Envoyer un Message</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudents([]);
              }}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Destinataires
              </label>
              <button
                onClick={handleSelectAll}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {selectedStudents.length === filteredStudents.length
                  ? 'Désélectionner tout'
                  : 'Sélectionner tout'}
              </button>
            </div>
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {filteredStudents.map(student => (
                <label
                  key={student.id}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleToggleStudent(student.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {student.firstName} {student.lastName} - {student.gradeLevel}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStudents.length} élève(s) sélectionné(s)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
              <span className="text-sm text-gray-500 ml-2">
                (Utilisez [texte](url) pour les liens)
              </span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Écrivez votre message... Exemple: Consultez [ce document](https://example.com)"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim() || selectedStudents.length === 0}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}