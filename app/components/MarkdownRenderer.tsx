import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const customComponents: Components = {
    pre: ({ children }) => (
      <pre className="bg-black text-gray-400 p-4 mt-4 mb-4 rounded-md overflow-x-auto whitespace-pre-wrap">
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className="font-mono text-sm bg-black text-gray-400 p-1 rounded">
        {children}
      </code>
    ),
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;