import React from 'react';
import { GraduationCap, Brain, Award, ArrowRight, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8">
            Master Mathematics<br />
            <span className="text-indigo-600">One Step at a Time</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Join our interactive learning platform designed to make mathematics engaging, 
            accessible, and fun for students of all levels.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Brain className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Learning</h3>
              <p className="text-gray-600">
                Engage with dynamic quizzes and exercises that adapt to your learning pace
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
              <p className="text-gray-600">
                Learn from carefully crafted exercises designed by math education experts
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Award className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your improvement with detailed performance analytics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Access - Modernized */}
      <div className="fixed bottom-6 right-6 group">
        <Link
          to="/admin"
          className="flex items-center justify-center w-12 h-12 bg-white shadow-lg rounded-full hover:scale-110 transition-all duration-300 group-hover:ring-4 ring-indigo-50"
          title="Administration"
        >
          <Settings className="h-6 w-6 text-gray-600 group-hover:text-indigo-600 transition-colors duration-300" />
        </Link>
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-gray-900 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap">
            Accès administrateur
          </div>
        </div>
      </div>
    </div>
  );
}