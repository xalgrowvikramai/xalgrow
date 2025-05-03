import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/components/ui/theme-provider';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Generate line numbers based on content
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.textContent || '');
    }
  };

  // Update the editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.textContent !== value) {
      editorRef.current.textContent = value;
    }
  }, [value]);

  return (
    <div className={`flex h-full ${className}`}>
      {/* Line Numbers */}
      <div className="line-numbers py-2 px-3 text-right bg-gray-50 dark:bg-gray-700 text-gray-400 select-none w-12">
        {lineNumbers.map((num) => (
          <div key={num}>{num}</div>
        ))}
      </div>
      
      {/* Code Content */}
      <div
        ref={editorRef}
        className="code-editor p-2 flex-1 text-sm font-mono bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre-wrap"
        contentEditable={!readOnly}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onInput={handleInput}
        suppressContentEditableWarning={true}
        spellCheck={false}
        data-language={language}
      />
    </div>
  );
};

export { CodeEditor };
