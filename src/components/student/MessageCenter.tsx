import React, { useState } from 'react';
import { MessageCircle, X, ArrowLeft, Trash2 } from 'lucide-react';
import { formatMessageWithLinks } from '../../lib/messages';
import type { Message } from '../../types/messages';

interface MessageCenterProps {
  messages: Message[];
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MessageCenter({ messages, onMarkAsRead, onDelete }: MessageCenterProps) {
  const [showMessages, setShowMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const unreadCount = messages.filter(m => !m.read).length;

  const handleMessageClick = (message: Message) => {
    if (!message.read) {
      onMarkAsRead(message.id);
    }
    setSelectedMessage(message);
  };

  const handleBack = () => {
    setSelectedMessage(null);
  };

  const handleDelete = (messageId: string) => {
    if (onDelete) {
      onDelete(messageId);
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMessages(!showMessages)}
        className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showMessages && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            {selectedMessage ? (
              <>
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </button>
                {onDelete && (
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="text-red-500 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">Messages</h3>
                <button
                  onClick={() => setShowMessages(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {selectedMessage ? (
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    De: {selectedMessage.from}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </p>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageWithLinks(selectedMessage.content)
                  }}
                />
              </div>
            ) : messages.length > 0 ? (
              <div className="divide-y">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      message.read ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {message.from}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {message.content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').replace(/https?:\/\/[^\s]+/g, 'Link')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!message.read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(message.id);
                          }}
                          className="ml-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Aucun message
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}