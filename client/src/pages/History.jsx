import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import { fetchHistory, deleteHistoryItem } from '../services/api';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadHistory = async (targetPage = 1) => {
    try {
      setLoading(true);
      setMessage('');

      const res = await fetchHistory(targetPage);
      setItems(res.data.items || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      loadHistory(page);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete history item.');
    }
  };

  const handleOpen = (item) => {
    navigate('/dashboard', { state: { historyItem: item } });
  };

  return (
    <div>
      <Header />
      <main className="history-wrap">
        <h2>Saved Code History</h2>

        {message && <p className="history-message">{message}</p>}

        {loading ? (
          <div className="history-loading">Loading history...</div>
        ) : items.length === 0 ? (
          <p className="history-empty">No saved sessions yet.</p>
        ) : (
          <ul className="history-list">
            {items.map((item) => (
              <li key={item._id} className="history-item">
                <div className="history-item-meta">
                  <strong>{item.language}</strong>
                  <span>{new Date(item.savedAt).toLocaleString()}</span>
                </div>

                <pre>{item.code.slice(0, 220)}{item.code.length > 220 ? '...' : ''}</pre>

                <div className="history-item-actions">
                  <button type="button" className="btn btn-primary" onClick={() => handleOpen(item)}>
                    Open in Editor
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="history-pagination">
          <button type="button" disabled={page <= 1} onClick={() => loadHistory(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => loadHistory(page + 1)}>
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default History;
