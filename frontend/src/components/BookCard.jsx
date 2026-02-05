import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/config';
import './BookCard.css';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  
  // Placeholder as data URL (gray book icon)
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280"%3E%3Crect fill="%232a2a2a" width="200" height="280"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3ENo Cover%3C/text%3E%3C/svg%3E';
  
  // Always use backend API endpoint for thumbnails (backend will handle Drive URLs)
  const thumbnailUrl = (book.thumbnailPath && book.thumbnailPath !== 'NULL')
    ? `${API_BASE_URL}/api/thumbnails/book_${book.id}.jpg`
    : placeholderImage;

  const handleReadClick = (e) => {
    e.stopPropagation();
    navigate(`/sach/${book.id}`);
  };

  return (
    <div className="book-card" onClick={() => navigate(`/sach/${book.id}`)}>
      <div className="book-cover">
        <img 
          src={thumbnailUrl} 
          alt={book.name}
          onError={(e) => {
            console.error('Image load failed for book', book.id);
            e.target.src = placeholderImage;
          }}
        />
        <div className="book-overlay">
          <div className="overlay-content">
            <button className="btn-read" onClick={handleReadClick}>Đọc Ngay</button>
          </div>
        </div>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.name}</h3>
        <p className="book-author">{book.author}</p>
        {book.category && (
          <div className="book-categories">
            {book.category.split(',').map((cat, index) => (
              <span key={index} className="category-tag">{cat.trim()}</span>
            ))}
          </div>
        )}
        <p className="book-stats">
          <span className="views">👁️ {(book.views || 0).toLocaleString()} lượt xem</span>
        </p>
      </div>
    </div>
  );
};

export default BookCard;
