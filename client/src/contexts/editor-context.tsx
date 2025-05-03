import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateCodeWithOpenAI } from '@/lib/openai';
import { generateCodeWithAnthropic } from '@/lib/anthropic';
import { ProjectFile } from '@/types';
import { AIModel, ChatMessage, PreviewDevice } from '@/types';

interface EditorContextType {
  activeFile: ProjectFile | null;
  activeFileContent: string;
  previewDevice: PreviewDevice;
  chatMessages: ChatMessage[];
  selectedModel: AIModel;
  userPrompt: string;
  isGenerating: boolean;
  setActiveFile: (file: ProjectFile | null) => void;
  updateActiveFileContent: (content: string) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setSelectedModel: (model: AIModel) => void;
  setUserPrompt: (prompt: string) => void;
  sendChatMessage: (message: string) => Promise<void>;
  insertGeneratedCode: (code: string) => void;
}

const EditorContext = createContext<EditorContextType>({
  activeFile: null,
  activeFileContent: '',
  previewDevice: 'desktop',
  chatMessages: [],
  selectedModel: 'openai',
  userPrompt: '',
  isGenerating: false,
  setActiveFile: () => {},
  updateActiveFileContent: () => {},
  setPreviewDevice: () => {},
  setSelectedModel: () => {},
  setUserPrompt: () => {},
  sendChatMessage: async () => {},
  insertGeneratedCode: () => {},
});

export const useEditor = () => useContext(EditorContext);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [activeFileContent, setActiveFileContent] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'system',
      content: "Hi there! I'm your AI coding assistant. How can I help you with your project today?",
      timestamp: new Date()
    }
  ]);
  const [selectedModel, setSelectedModel] = useState<AIModel>('openai');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const { toast } = useToast();

  const handleSetActiveFile = (file: ProjectFile | null) => {
    setActiveFile(file);
    if (file) {
      setActiveFileContent(file.content);
    } else {
      setActiveFileContent('');
    }
  };

  const updateActiveFileContent = (content: string) => {
    setActiveFileContent(content);
  };

  const insertGeneratedCode = (code: string) => {
    if (activeFile) {
      const newContent = activeFileContent + '\n' + code;
      setActiveFileContent(newContent);
      
      toast({
        title: "Code inserted",
        description: "Generated code has been inserted into the editor",
      });
    } else {
      toast({
        title: "Cannot insert code",
        description: "No file is currently active in the editor",
        variant: "destructive",
      });
    }
  };

  const sendChatMessage = async (message: string): Promise<void> => {
    try {
      setIsGenerating(true);
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      // Generate response based on selected model
      let response;
      if (selectedModel === 'openai') {
        response = await generateCodeWithOpenAI(message);
      } else {
        response = await generateCodeWithAnthropic(message);
      }
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setUserPrompt('');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate code';
      toast({
        title: "Code generation failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const value = {
    activeFile,
    activeFileContent,
    previewDevice,
    chatMessages,
    selectedModel,
    userPrompt,
    isGenerating,
    setActiveFile: handleSetActiveFile,
    updateActiveFileContent,
    setPreviewDevice,
    setSelectedModel,
    setUserPrompt,
    sendChatMessage,
    insertGeneratedCode,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
