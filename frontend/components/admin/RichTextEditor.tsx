'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list',
    'link'
  ];

  if (!isClient) {
    return <div className="h-32 bg-gray-100 rounded animate-pulse" />;
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{
          height: height,
          direction: 'ltr'
        }}
      />
      
      <style jsx global>{`
        .ql-editor {
          min-height: ${height};
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }
        .ql-editor * {
          direction: ltr !important;
          text-align: left !important;
        }
        .ql-toolbar {
          border-top: 1px solid #779BA8;
          border-left: 1px solid #779BA8;
          border-right: 1px solid #779BA8;
        }
        .ql-container {
          border-bottom: 1px solid #779BA8;
          border-left: 1px solid #779BA8;
          border-right: 1px solid #779BA8;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
