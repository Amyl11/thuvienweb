import { useState, useEffect, useRef } from 'react';
import BookCard from '../components/BookCard';
import TrendingSection from '../components/TrendingSection';
import Pagination from '../components/Pagination';
import { bookAPI } from '../services/api';
import './HomePage.css';

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 24;
  const booksRef = useRef(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAllBooks();
      // Lưu toàn bộ sách để TrendingSection có thể sort đúng
      setBooks(response.data);
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

  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  return (
    <div className="homepage">
      <div className="container">
        <div className="content-wrapper">
          <div className="books-section" ref={booksRef}>
            <div className="books-grid">
              {paginatedBooks.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book}
                />
              ))}
            </div>

            {/* Pagination */}
            {!loading && books.length > booksPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                scrollRef={booksRef}
              />
            )}
          </div>

          {/* TrendingSection nhận toàn bộ sách để sort đúng */}
          <TrendingSection books={books} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
