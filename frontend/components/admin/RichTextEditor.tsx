'use client';

import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  height = "200px"
}) => {
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    // Trigger onChange with the current content
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Ctrl+B for bold, Ctrl+I for italic, etc.
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  };

  if (!isClient) {
    return <div className="h-32 bg-gray-100 rounded animate-pulse" />;
  }

  return (
    <div className="rich-text-editor border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h1')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h2')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h3')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              execCommand('createLink', url);
            }
          }}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Insert Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Remove Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-themeTeal focus:border-transparent transition-all duration-200"
        style={{ 
          height: height, 
          minHeight: height,
          fontSize: '14px',
          lineHeight: '1.5',
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'normal'
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        .rich-text-editor [contenteditable] {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #999;
          font-style: italic;
          direction: ltr;
          text-align: left;
        }
        .rich-text-editor [contenteditable]:focus:before {
          content: none;
        }
        .rich-text-editor [contenteditable] * {
          direction: ltr !important;
          text-align: left !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
