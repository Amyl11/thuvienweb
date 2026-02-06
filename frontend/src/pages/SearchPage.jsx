import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { bookAPI } from '../services/api';
import { CATEGORIES, AUTHORS } from '../constants/categories';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    author: '',
    sort: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 12;
  const resultsRef = useRef(null);

  useEffect(() => {
    const genreParam = searchParams.get('genre');
    const authorParam = searchParams.get('author');
    
    if (genreParam || authorParam) {
      // Set filters first
      const newFilters = { ...filters };
      if (genreParam) newFilters.genre = genreParam;
      if (authorParam) newFilters.author = authorParam;
      setFilters(newFilters);
      
      // Then trigger search automatically
      performSearch(newFilters);
    } else {
      // Fetch all books on initial load
      fetchBooks();
    }
  }, [searchParams]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await bookAPI.getAllBooks();
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const performSearch = async (searchFilters = filters) => {
    setLoading(true);
    try {
      let response;

      // Search by keyword if searchTerm is provided
      if (searchTerm) {
        response = await bookAPI.searchByKeyword(searchTerm);
      } 
      // Filter by category - find label from value
      else if (searchFilters.genre) {
        const selectedCategory = CATEGORIES.find(cat => cat.value === searchFilters.genre);
        const categoryLabel = selectedCategory ? selectedCategory.label : searchFilters.genre;
        response = await bookAPI.searchByCategory(categoryLabel);
      }
      // Filter by author - find label from value
      else if (searchFilters.author) {
        const selectedAuthor = AUTHORS.find(auth => auth.value === searchFilters.author);
        const authorLabel = selectedAuthor ? selectedAuthor.label : searchFilters.author;
        response = await bookAPI.searchByAuthor(authorLabel);
      }
      // Get all books
      else {
        response = await bookAPI.getAllBooks();
      }

      let results = response.data;

      // Apply client-side sorting
      if (searchFilters.sort) {
        results = sortResults(results, searchFilters.sort);
      }

      setSearchResults(results);
      setCurrentPage(1); // Reset về trang 1
      
      // Scroll to results section after search completes
      if (resultsRef.current) {
        setTimeout(() => {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  const sortResults = (results, sortType) => {
    const sorted = [...results];
    switch (sortType) {
      case 'update-desc':
        return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      case 'update-asc':
        return sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
      case 'view-desc':
        // Mock sorting by views (you'll need to add views field to backend)
        return sorted.reverse();
      case 'view-asc':
        return sorted;
      default:
        return sorted;
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilters({
      genre: '',
      author: '',
      sort: ''
    });
    fetchBooks();
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>TÌM KIẾM SÁCH</h1>
          <p>Tìm kiếm sách theo từ khóa, thể loại, tác giả và nhiều tiêu chí khác</p>
        </div>

        <div className="search-main">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Nhập tên sách, tác giả, từ khóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-search" onClick={handleSearch}>
              🔍 Tìm kiếm
            </button>
          </div>

          <div className="search-filters">
            <h2>BỘ LỌC TÌM KIẾM</h2>
            
            <div className="filter-grid">
              <div className="filter-group">
                <label>Thể loại</label>
                <select 
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  <option value="">Tất cả thể loại</option>
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Tác giả</label>
                <select 
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                >
                  <option value="">Tất cả tác giả</option>
                  {AUTHORS.map(author => (
                    <option key={author.value} value={author.value}>
                      {author.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sắp xếp theo</label>
                <select 
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="">Mặc định</option>
                  <option value="update-desc">Mới cập nhật</option>
                  <option value="update-asc">Cũ nhất</option>
                  <option value="view-desc">Lượt xem cao nhất</option>
                  <option value="view-asc">Lượt xem thấp nhất</option>
                </select>
              </div>
            </div>

            <div className="filter-actions">
              <button className="btn-apply" onClick={handleSearch}>
                Áp dụng bộ lọc
              </button>
              <button className="btn-reset" onClick={handleReset}>
                Đặt lại
              </button>
            </div>
          </div>

          <div className="search-results" ref={resultsRef}>
            <div className="results-header">
              <h2>KẾT QUẢ TÌM KIẾM</h2>
              <span className="results-count">
                {loading ? (
                  'Đang tìm kiếm...'
                ) : (
                  <>Tìm thấy <strong>{searchResults.length}</strong> kết quả</>
                )}
              </span>
            </div>

            <div className="results-grid">
              {loading ? (
                <div className="loading">Đang tải...</div>
              ) : searchResults.length > 0 ? (
                searchResults
                  .slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)
                  .map(book => (
                    <BookCard 
                      key={book.id} 
                      book={book}
                    />
                  ))
              ) : (
                <div className="no-results">Không tìm thấy kết quả nào</div>
              )}
            </div>

            {/* Pagination */}
            {!loading && searchResults.length > resultsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(searchResults.length / resultsPerPage)}
                onPageChange={setCurrentPage}
                scrollRef={resultsRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
