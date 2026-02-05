import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import { bookAPI } from '../services/api';
import './HotBooksPage.css';

const HotBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotBooks();
  }, []);

  const fetchHotBooks = async () => {
    try {
      const response = await bookAPI.getAllBooks();
      // Sort by views descending to get hot books
      const sortedBooks = response.data.sort((a, b) => (b.views || 0) - (a.views || 0));
      setBooks(sortedBooks);
    } catch (error) {
      console.error('Error fetching hot books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hot-books-page">
        <div className="container">
          <div className="loading">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="hot-books-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🔥 TRUYỆN HOT</h1>
          <p className="page-subtitle">Những truyện được xem nhiều nhất</p>
        </div>

        <div className="books-grid">
          {books.map((book, index) => (
            <div key={book.id} className="book-item-wrapper">
              <div className="book-rank">#{index + 1}</div>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotBooksPage;
