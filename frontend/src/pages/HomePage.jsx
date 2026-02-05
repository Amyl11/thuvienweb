import { useState, useEffect } from 'react';
import BookCard from '../components/BookCard';
import TrendingSection from '../components/TrendingSection';
import { bookAPI } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAllBooks();
      // Giới hạn tối đa 24 sách trên trang chủ
      setBooks(response.data.slice(0, 24));
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="homepage">
        <div className="container">
          <div className="loading">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="container">
        <div className="content-wrapper">
          <div className="books-section">
            <div className="books-grid">
              {books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book}
                />
              ))}
            </div>
          </div>

          <TrendingSection books={books} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
