import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRender = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      strong: ({node, ...props}) => <strong style={{color:'#ffb347'}} {...props} />,
      code: ({node, ...props}) => <code style={{background:'#232536',color:'#7c5cfc',padding:'2px 5px',borderRadius:4}} {...props} />,
      li: ({node, ...props}) => <li style={{marginBottom:4}} {...props} />,
    }}
  >
    {children}
  </ReactMarkdown>
);

export default MarkdownRender;
