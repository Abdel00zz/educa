import React, { useState } from 'react';
import { Users, Clock, Calendar, Activity, Trash2, AlertCircle, BookOpen, Award, TrendingUp, Search } from 'lucide-react';
import type { Student } from '../../types';
import { StudentStats } from './StudentStats';
import { deleteStudent } from '../../lib/student';

interface StudentListProps {
  students: Student[];
  onUpdate: () => void;
}

export function StudentList({ students, onUpdate }: StudentListProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const classes = Array.from(new Set(students.map(s => s.gradeLevel))).sort();

  const filteredStudents = students.filter(student => {
    const matchesSearch = (
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesClass = !selectedClass || student.gradeLevel === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleDelete = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      setShowDeleteConfirm(null);
      onUpdate();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Une erreur est survenue lors de la suppression');
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400" />
              <h2 className="ml-2 text-lg font-medium text-gray-900">Élèves Inscrits</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Toutes les classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 border-b flex justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {filteredStudents.length} élèves
            </span>
            <span className="flex items-center text-green-600">
              <Award className="h-4 w-4 mr-1" />
              {filteredStudents.filter(s => s.progress?.completionRate > 80).length} excellents
            </span>
            <span className="flex items-center text-indigo-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {filteredStudents.filter(s => s.lastLogin && new Date(s.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length} actifs
            </span>
          </div>
        </div>

        <ul className="divide-y divide-gray-100">
          {filteredStudents.map((student) => (
            <li 
              key={student.id} 
              className="px-6 py-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {student.firstName[0]}{student.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-gray-600">Inscrit le {new Date(student.joinedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className={`${student.lastLogin ? 'text-gray-600' : 'text-red-500'}`}>
                      {student.lastLogin 
                        ? `Dernière connexion: ${new Date(student.lastLogin).toLocaleString()}` 
                        : 'Jamais connecté'}
                    </span>
                  </div>
                  <div className="flex items-center min-w-[120px]">
                    <Activity className="h-4 w-4 mr-1" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-600">Progression</span>
                        <span className={`text-xs font-medium ${
                          (student.progress?.completionRate || 0) >= 80 ? 'text-green-600' :
                          (student.progress?.completionRate || 0) >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {student.progress?.completionRate || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            (student.progress?.completionRate || 0) >= 80 ? 'bg-green-500' :
                            (student.progress?.completionRate || 0) >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${student.progress?.completionRate || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(student.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Supprimer l'élève"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedStudent && (
        <StudentStats
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
      
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Confirmer la suppression</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}