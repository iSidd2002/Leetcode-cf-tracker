import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, readOnly = false }) => {
  if (readOnly) {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {value || "No notes provided."}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="markdown-editor-container grid grid-cols-1 md:grid-cols-2 gap-4">
      <textarea
        value={value}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value);
          }
        }}
        className="markdown-textarea p-2 border rounded-md font-mono bg-background text-foreground min-h-[150px]"
        placeholder="Write your notes in Markdown..."
      />
      <div className="markdown-preview p-2 border rounded-md bg-card prose dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {value || "Preview will appear here"}
        </ReactMarkdown>
      </div>
    </div>
  );
}; 