import React from 'react';
import { LogOut, RefreshCw, Settings, Bell, MessageCircle, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationBell } from '../student/NotificationBell';
import { MessageCenter } from '../student/MessageCenter';

interface NavigationProps {
  userType: 'admin' | 'student';
  onRefresh?: () => void;
  onManageClasses?: () => void;
  notifications?: any[];
  messages?: any[];
  onClearNotification?: (id: string) => void;
  onMarkMessageRead?: (id: string) => void;
  onOpenMessageSender?: () => void;
}

export function Navigation({ 
  userType, 
  onRefresh, 
  onManageClasses,
  notifications = [],
  messages = [],
  onClearNotification,
  onMarkMessageRead,
  onOpenMessageSender
}: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    // Force a full page reload while maintaining the current route
    window.location.href = location.pathname;
  };

  const handleLogout = () => {
    // Clear any stored session data
    localStorage.removeItem('session');
    localStorage.removeItem('studentSession');
    localStorage.removeItem('adminSession');
    // Redirect to home
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {userType === 'admin' ? 'Dashboard Admin' : 'Espace Étudiant'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {userType === 'admin' && onOpenMessageSender && (
              <button
                onClick={onOpenMessageSender}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Envoyer un Message"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
            {userType === 'student' && (
              <>
                <NotificationBell 
                  notifications={notifications}
                  onClear={onClearNotification || (() => {})}
                />
                <MessageCenter
                  messages={messages}
                  onMarkAsRead={onMarkMessageRead || (() => {})}
                />
              </>
            )}
            {userType === 'admin' && onManageClasses && (
              <button
                onClick={onManageClasses}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Gérer les Classes"
              >
                <Settings className="h-5 w-5" />
              </button>
            )}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}