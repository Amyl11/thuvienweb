import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CATEGORIES, AUTHORS } from '../constants/categories';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  const genres = CATEGORIES;
  const authors = AUTHORS;

  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleGenreClick = (genreValue) => {
    navigate(`/tim-kiem?genre=${genreValue}`);
    setOpenDropdown(null);
  };

  const handleAuthorClick = (authorValue) => {
    navigate(`/tim-kiem?author=${authorValue}`);
    setOpenDropdown(null);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>THƯ VIỆN</h1>
              <p>Đọc Truyện Online</p>
            </div>
            
            <div className="header-actions">
              <button className="btn-history">
                <i className="icon">📚</i> Lịch sử
              </button>
              <button className="btn-favorite">
                <i className="icon">❤️</i> Yêu thích
              </button>
              <button className="btn-bookmark">
                <i className="icon">📑</i> Bookmark
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="container">
          <ul className="nav-menu">
            <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              <a href="/">TRANG CHỦ</a>
            </li>
            <li className={`nav-item ${location.pathname === '/tim-kiem' ? 'active' : ''}`}>
              <a href="/tim-kiem">TÌM KIẾM 🔍</a>
            </li>
            <li className={`nav-item dropdown ${openDropdown === 'genre' ? 'open' : ''}`}>
              <span className="nav-link" onClick={() => handleDropdownToggle('genre')}>
                THỂ LOẠI ▼
              </span>
              {openDropdown === 'genre' && (
                <div className="dropdown-menu genre-grid">
                  <div className="category-group">
                    <div className="category-group-title">Kinh tế - Tài chính</div>
                    <div className="category-group-items">
                      {genres.slice(0, 5).map(genre => (
                        <div key={genre.value} className="category-item" onClick={() => handleGenreClick(genre.value)}>
                          {genre.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="category-group">
                    <div className="category-group-title">Phiêu lưu - Kinh dị</div>
                    <div className="category-group-items">
                      {genres.slice(5, 10).map(genre => (
                        <div key={genre.value} className="category-item" onClick={() => handleGenreClick(genre.value)}>
                          {genre.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="category-group">
                    <div className="category-group-title">Hài hước - Lãng mạn</div>
                    <div className="category-group-items">
                      {genres.slice(10, 15).map(genre => (
                        <div key={genre.value} className="category-item" onClick={() => handleGenreClick(genre.value)}>
                          {genre.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="category-group">
                    <div className="category-group-title">Cổ trang - Tiên hiệp</div>
                    <div className="category-group-items">
                      {genres.slice(15, 19).map(genre => (
                        <div key={genre.value} className="category-item" onClick={() => handleGenreClick(genre.value)}>
                          {genre.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="category-group">
                    <div className="category-group-title">Lịch sử - Địa lý</div>
                    <div className="category-group-items">
                      {genres.slice(19, 23).map(genre => (
                        <div key={genre.value} className="category-item" onClick={() => handleGenreClick(genre.value)}>
                          {genre.label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="category-group">
                    <div className="category-group-title">Trẻ em - Truyện tranh</div>
                    <div className="category-group-items">
                      {genres.slice(23, 31).map(genre => (
                        <div key={genre.value} className="category-item" onClick={() => handleGenreClick(genre.value)}>
                          {genre.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>
            <li className={`nav-item dropdown ${openDropdown === 'author' ? 'open' : ''}`}>
              <span className="nav-link" onClick={() => handleDropdownToggle('author')}>
                TÁC GIẢ ▼
              </span>
              {openDropdown === 'author' && (
                <div className="dropdown-menu">
                  {authors.map(author => (
                    <div 
                      key={author.value} 
                      className="dropdown-item"
                      onClick={() => handleAuthorClick(author.value)}
                    >
                      {author.label}
                    </div>
                  ))}
                </div>
              )}
            </li>
            <li className={`nav-item ${location.pathname === '/truyen-hot' ? 'active' : ''}`}>
              <a href="/truyen-hot">TRUYỆN HOT</a>
            </li>
            <li className={`nav-item ${location.pathname === '/lich-su' ? 'active' : ''}`}>
              <a href="/lich-su">LỊCH SỬ</a>
            </li>
            <li className={`nav-item ${location.pathname === '/them-truyen' ? 'active' : ''}`}>
              <a href="/them-truyen">➕ THÊM TRUYỆN</a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
