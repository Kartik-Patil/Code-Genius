
import { useMemo, useState } from 'react';
import MarkdownRender from './MarkdownRender';
import './AIPanel.css';

const tabs = [
  { key: 'errors', label: 'Errors', icon: '✗', color: '#ff4d4f' },
  { key: 'suggestions', label: 'Suggestions', icon: '💡', color: '#ffc107' },
  { key: 'explanation', label: 'Explain', icon: '📝', color: '#7c5cfc' },
];

const AIPanel = ({ loading, data }) => {
  const [activeTab, setActiveTab] = useState('errors');

  const activeContent = useMemo(() => {
    if (!data) return '';
    return data[activeTab] || '';
  }, [data, activeTab]);

  return (
    <section className="ai-panel">
      <div className="ai-panel-tabs" role="tablist" aria-label="AI result tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`ai-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? { borderBottom: `3px solid ${tab.color}` } : {}}
          >
            <span style={{ marginRight: 6, fontSize: 16 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ai-panel-content">
        {loading ? (
          <div className="ai-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : activeContent ? (
          <div className="ai-markdown-wrap">
            <MarkdownRender>{activeContent}</MarkdownRender>
          </div>
        ) : (
          <p className="ai-empty">Run Analyze to see AI feedback.</p>
        )}
      </div>
    </section>
  );
};

export default AIPanel;
