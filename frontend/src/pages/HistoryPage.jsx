import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { historyStorage } from '../utils/historyStorage';
import './HistoryPage.css';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const data = historyStorage.getHistory();
    setHistory(data);
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử đọc truyện?')) {
      historyStorage.clearHistory();
      setHistory([]);
    }
  };

  const handleRemoveItem = (bookId) => {
    const updated = historyStorage.removeFromHistory(bookId);
    setHistory(updated);
  };

  if (history.length === 0) {
    return (
      <div className="history-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">📚 LỊCH SỬ ĐỌC TRUYỆN</h1>
            <p className="page-subtitle">Các truyện bạn đã xem gần đây</p>
          </div>
          <div className="empty-history">
            <div className="empty-icon">📖</div>
            <h2>Chưa có lịch sử</h2>
            <p>Lịch sử đọc truyện của bạn sẽ hiển thị ở đây</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📚 LỊCH SỬ ĐỌC TRUYỆN</h1>
          <p className="page-subtitle">Các truyện bạn đã xem gần đây</p>
          <button className="btn-clear-history" onClick={handleClearHistory}>
            🗑️ Xóa toàn bộ lịch sử
          </button>
        </div>

        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-item-wrapper">
              <BookCard 
                book={{
                  id: item.id,
                  name: item.name,
                  author: item.author,
                  category: item.category,
                  thumbnailPath: item.thumbnailPath,
                  views: item.views || 0
                }} 
              />
              <div className="history-info">
                <span className="history-time">
                  {new Date(item.timestamp).toLocaleString('vi-VN')}
                </span>
                <button 
                  className="btn-remove-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveItem(item.id);
                  }}
                  title="Xóa khỏi lịch sử"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
