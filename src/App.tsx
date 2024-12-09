import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { MathJaxContext } from 'better-react-mathjax';
import { ClassChapterProvider } from './contexts/ClassChapterContext';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { RegisterForm } from './components/auth/RegisterForm';
import { StudentLoginForm } from './components/auth/StudentLoginForm';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { StudentDashboard } from './pages/StudentDashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/register",
    element: <RegisterForm />,
  },
  {
    path: "/login",
    element: <StudentLoginForm />,
  },
  {
    path: "/admin",
    element: <LoginForm />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/student",
    element: <StudentDashboard />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  },
]);

function App() {
  return (
    <MathJaxContext>
      <AuthProvider>
        <ClassChapterProvider>
          <RouterProvider router={router} />
        </ClassChapterProvider>
      </AuthProvider>
    </MathJaxContext>
  );
}

export default App;