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
      <pre className="bg-muted text-foreground p-4 my-4 rounded-md border overflow-x-auto whitespace-pre-wrap">
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className="font-mono text-sm bg-muted px-1 py-0.5 rounded">
        {children}
      </code>
    ),
  };

  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none prose-code:before:content-none prose-code:after:content-none ${className || ''}`}>
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