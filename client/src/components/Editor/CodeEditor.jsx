import Editor from '@monaco-editor/react';
import './CodeEditor.css';

const CodeEditor = ({ language, value, onChange }) => {
  return (
    <div className="code-editor-shell">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue || '')}
        theme="vs-dark"
        options={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          lineNumbersMinChars: 3,
          tabSize: 2,
          smoothScrolling: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
