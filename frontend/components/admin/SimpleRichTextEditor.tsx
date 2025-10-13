'use client';

import React, { useState, useCallback } from 'react';

interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  height = "200px"
}) => {
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const insertTag = useCallback((tag: string) => {
    const textarea = document.querySelector('textarea[name="rich-text"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      
      let newText = '';
      if (tag === 'bold') {
        newText = `<strong>${selectedText || 'bold text'}</strong>`;
      } else if (tag === 'italic') {
        newText = `<em>${selectedText || 'italic text'}</em>`;
      } else if (tag === 'paragraph') {
        newText = `<p>${selectedText || 'paragraph text'}</p>`;
      } else if (tag === 'br') {
        newText = '<br>';
      }
      
      const newValue = value.substring(0, start) + newText + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted tag
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + newText.length, start + newText.length);
      }, 0);
    }
  }, [value, onChange]);

  return (
    <div className="border border-themeTealLighter rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-themeTealLighter">
        <button
          type="button"
          onClick={() => insertTag('bold')}
          className="px-2 py-1 text-xs font-bold bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertTag('italic')}
          className="px-2 py-1 text-xs italic bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertTag('paragraph')}
          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Paragraph"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => insertTag('br')}
          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          title="Line Break"
        >
          BR
        </button>
        <div className="flex-1"></div>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="px-2 py-1 text-xs bg-themeTeal text-white rounded hover:bg-themeTealLight transition-colors"
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div style={{ height }}>
        {isPreview ? (
          <div
            className="w-full p-3 text-sm text-themeTeal bg-white"
            dangerouslySetInnerHTML={{ __html: value || '<p>No content to preview</p>' }}
          />
        ) : (
          <textarea
            name="rich-text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full h-full p-3 text-sm border-0 resize-none focus:outline-none text-themeTealLight placeholder-text-themeTealLight"
            style={{ height: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;
