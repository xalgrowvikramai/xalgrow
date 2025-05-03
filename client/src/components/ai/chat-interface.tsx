import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useEditor } from '@/contexts/editor-context';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const { t } = useI18n();
  const { 
    chatMessages, 
    sendChatMessage, 
    userPrompt, 
    setUserPrompt, 
    selectedModel, 
    setSelectedModel,
    isGenerating,
    insertGeneratedCode
  } = useEditor();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (userPrompt.trim() && !isGenerating) {
      sendChatMessage(userPrompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(true);
    }
    
    if (e.key === 'Enter' && !isShiftPressed && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
    }
  };

  const handleInsertCode = (message: ChatMessage) => {
    // Extract code between ```javascript and ``` or just between ```
    const codeBlockRegex = /```(?:javascript|jsx|typescript|tsx|html|css|json)?\n([\s\S]*?)```/;
    const match = message.content.match(codeBlockRegex);
    
    if (match && match[1]) {
      insertGeneratedCode(match[1].trim());
    } else {
      // If no code block found, just insert the whole message
      insertGeneratedCode(message.content);
    }
  };

  const handleCopyToClipboard = (message: ChatMessage) => {
    const codeBlockRegex = /```(?:javascript|jsx|typescript|tsx|html|css|json)?\n([\s\S]*?)```/;
    const match = message.content.match(codeBlockRegex);
    
    const textToCopy = match && match[1] ? match[1].trim() : message.content;
    
    navigator.clipboard.writeText(textToCopy);
  };

  // Format code blocks in messages
  const formatMessage = (content: string) => {
    const parts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${lastIndex}`} className="text-sm">
            {content.substring(lastIndex, match.index)}
          </p>
        );
      }
      
      // Add code block
      const language = match[1] || '';
      const code = match[2];
      parts.push(
        <pre key={`code-${match.index}`} className="mt-2 text-xs bg-gray-200 dark:bg-gray-800 p-2 rounded overflow-auto">
          {code}
        </pre>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <p key={`text-${lastIndex}`} className="text-sm">
          {content.substring(lastIndex)}
        </p>
      );
    }
    
    return parts.length > 0 ? parts : <p className="text-sm">{content}</p>;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col h-[calc(100vh-12rem)] ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h2 className="font-semibold text-lg">{t('aiAssistant')}</h2>
        <div className="flex gap-2">
          <Select 
            value={selectedModel} 
            onValueChange={(value) => setSelectedModel(value as 'openai' | 'anthropic')}
          >
            <SelectTrigger className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-1 h-8 w-28">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">GPT-4</SelectItem>
              <SelectItem value="anthropic">Claude</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="ghost" 
            size="icon"
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <i className="ri-settings-line"></i>
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chatMessages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start gap-2 ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <i className="ri-robot-line text-primary-600 dark:text-primary-400"></i>
              </div>
            )}
            
            <div className={`rounded-lg p-3 max-w-[85%] ${
              message.role === 'user' 
                ? 'bg-primary-100 dark:bg-primary-900' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {formatMessage(message.content)}
              
              {message.role === 'assistant' && message.content.includes('```') && (
                <div className="mt-2 flex gap-2">
                  <button 
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    onClick={() => handleCopyToClipboard(message)}
                  >
                    Copy to clipboard
                  </button>
                  <button 
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    onClick={() => handleInsertCode(message)}
                  >
                    Insert into editor
                  </button>
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                <i className="ri-user-line text-gray-600 dark:text-gray-400"></i>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Type a message..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            rows={2}
            disabled={isGenerating}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!userPrompt.trim() || isGenerating}
            className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full h-10 w-10 flex items-center justify-center"
          >
            {isGenerating ? (
              <i className="ri-loader-4-line animate-spin"></i>
            ) : (
              <i className="ri-send-plane-fill"></i>
            )}
          </Button>
        </div>
        <div className="mt-2 flex text-xs text-gray-500 justify-between">
          <span>Shift + Enter for new line</span>
          <div className="flex gap-2">
            <button className="hover:text-gray-700 dark:hover:text-gray-300">
              <i className="ri-mic-line"></i>
            </button>
            <button className="hover:text-gray-700 dark:hover:text-gray-300">
              <i className="ri-attachment-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChatInterface };
