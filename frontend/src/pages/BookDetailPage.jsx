import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI } from '../services/api';
import { historyStorage } from '../utils/historyStorage';
import { API_BASE_URL } from '../config/config';
import './BookDetailPage.css';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookDetail();
    // Increment view count
    bookAPI.incrementViews(id).catch(err => console.error('Error incrementing views:', err));
  }, [id]);

  const fetchBookDetail = async () => {
    try {
      const response = await bookAPI.getBookById(id);
      const bookData = response.data;
      setBook(bookData);
      
      // Add to reading history
      historyStorage.addToHistory(bookData);
    } catch (error) {
      console.error('Error fetching book detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="loading">Đang tải thông tin sách...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="error">Không tìm thấy sách!</div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = (book.thumbnailPath && book.thumbnailPath !== 'NULL')
    ? `${API_BASE_URL}/api/thumbnails/book_${book.id}.jpg`
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280"%3E%3Crect fill="%232a2a2a" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3ENo Cover%3C/text%3E%3C/svg%3E';

  return (
    <div className="book-detail-page">
      <div className="container">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Quay lại
        </button>

        <div className="book-detail-content">
          <div className="book-cover-section">
            <img src={thumbnailUrl} alt={book.name} className="book-cover-large" />
          </div>

          <div className="book-info-section">
            <h1 className="book-title-large">{book.name}</h1>
            
            <div className="book-meta">
              <div className="meta-item">
                <span className="meta-label">Tác giả:</span>
                <span className="meta-value">{book.author}</span>
              </div>

              {book.category && (
                <div className="meta-item">
                  <span className="meta-label">Thể loại:</span>
                  <div className="meta-categories">
                    {book.category.split(',').map((cat, index) => (
                      <span key={index} className="category-tag-large">{cat.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="meta-item">
                <span className="meta-label">Lượt xem:</span>
                <span className="meta-value">👁️ {(book.views || 0).toLocaleString()}</span>
              </div>

              <div className="meta-item">
                <span className="meta-label">Cập nhật:</span>
                <span className="meta-value">
                  {new Date(book.updatedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="book-actions">
              {book.bookPath ? (
                <>
                  <button 
                    className="btn-read-large"
                    onClick={() => navigate(`/doc/${book.id}`)}
                  >
                    📖 Đọc Truyện
                  </button>
                  <button 
                    className="btn-download"
                    onClick={() => {
                      // Extract file ID from Drive URL (format: export=view&id=FILE_ID)
                      const fileIdMatch = book.bookPath.match(/id=([^&]+)/);
                      if (fileIdMatch) {
                        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
                        window.open(downloadUrl, '_blank');
                      } else {
                        window.open(book.bookPath, '_blank');
                      }
                    }}
                  >
                    ⬇️ Tải Xuống
                  </button>
                </>
              ) : (
                <button className="btn-read-large disabled" disabled>
                  Chưa có file PDF
                </button>
              )}
            </div>

            {book.bookPath && (
              <div className="book-path-info">
                <span className="path-label">File:</span>
                <span className="path-value">{book.bookPath}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
