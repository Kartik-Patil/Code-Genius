import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Layout/Header';
import CodeEditor from '../components/Editor/CodeEditor';
import AIPanel from '../components/AIPanel/AIPanel';
import useDebounce from '../hooks/useDebounce';
import {
  detectErrors,
  getSuggestions,
  explainCode,
  saveHistory,
} from '../services/api';
import ErrorBoundary from '../components/Layout/ErrorBoundary';
import './Dashboard.css';

const defaultSample = `function greet(name) {
  console.log('Hello ' + name)
}

greet('Code Genius')`;

const AI_REQUEST_TIMEOUT_MS = 30000;

const Dashboard = () => {
  const location = useLocation();
  const selectedHistoryItem = location.state?.historyItem;

  const [language, setLanguage] = useState(selectedHistoryItem?.language || 'javascript');
  const [code, setCode] = useState(selectedHistoryItem?.code || defaultSample);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [aiResult, setAiResult] = useState(
    selectedHistoryItem?.aiResponse || {
      errors: '',
      suggestions: '',
      explanation: '',
    }
  );

  const aiAbortRef = useRef(null);
  const autoDetectAbortRef = useRef(null);
  const debouncedCode = useDebounce(code, 300);

  const canAnalyze = useMemo(() => code.trim().length > 0 && !loading, [code, loading]);

  useEffect(() => {
    if (!selectedHistoryItem) return;

    setLanguage(selectedHistoryItem.language || 'javascript');
    setCode(selectedHistoryItem.code || defaultSample);
    setAiResult(
      selectedHistoryItem.aiResponse || {
        errors: '',
        suggestions: '',
        explanation: '',
      }
    );
    setMessage('History item loaded into editor.');
  }, [selectedHistoryItem]);

  useEffect(() => {
    const shouldAutoDetect = debouncedCode.trim().length >= 20 && !loading;
    if (!shouldAutoDetect) return;

    if (autoDetectAbortRef.current) {
      autoDetectAbortRef.current.abort();
    }

    const controller = new AbortController();
    autoDetectAbortRef.current = controller;

    const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    detectErrors({ code: debouncedCode, language }, { signal: controller.signal })
      .then((res) => {
        setAiResult((prev) => ({ ...prev, errors: res.data.result || '' }));
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setMessage(err.response?.data?.message || 'Auto-detect failed.');
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => controller.abort();
  }, [debouncedCode, language, loading]);

  useEffect(() => {
    return () => {
      if (aiAbortRef.current) aiAbortRef.current.abort();
      if (autoDetectAbortRef.current) autoDetectAbortRef.current.abort();
    };
  }, []);

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setMessage('');
    setLoading(true);

    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }

    const controller = new AbortController();
    aiAbortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const payload = { code, language };
      const [errorsRes, suggestionsRes, explainRes] = await Promise.all([
        detectErrors(payload, { signal: controller.signal }),
        getSuggestions(payload, { signal: controller.signal }),
        explainCode(payload, { signal: controller.signal }),
      ]);

      setAiResult({
        errors: errorsRes.data.result || '',
        suggestions: suggestionsRes.data.result || '',
        explanation: explainRes.data.result || '',
      });
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setMessage(err.response?.data?.message || 'Analyze request failed.');
      } else {
        setMessage('Analyze request timed out. Try again with smaller code input.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!code.trim()) {
      setMessage('Code cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      await saveHistory({
        code,
        language,
        aiResponse: aiResult,
      });

      setMessage('Saved to history successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save history.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="dashboard-wrap">
        <section className="dashboard-main">
          <div className="editor-toolbar">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <div className="toolbar-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <ErrorBoundary fallbackMessage="Editor failed to render.">
            <div className="editor-area">
              <CodeEditor language={language} value={code} onChange={setCode} />
            </div>
          </ErrorBoundary>
        </section>

        <aside className="dashboard-side">
          <ErrorBoundary fallbackMessage="AI panel failed to render.">
            <AIPanel loading={loading} data={aiResult} />
          </ErrorBoundary>
        </aside>
      </main>

      {message && <p className="dashboard-message">{message}</p>}
    </div>
  );
};

export default Dashboard;
