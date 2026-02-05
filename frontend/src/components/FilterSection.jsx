import { useState } from 'react';
import './FilterSection.css';

const FilterSection = () => {
  const [filters, setFilters] = useState({
    format: '',
    genre: '',
    author: '',
    year: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
    // Implement search logic here
  };

  return (
    <div className="filter-section">
      <div className="filters">
        <select 
          className="filter-select"
          value={filters.format}
          onChange={(e) => handleFilterChange('format', e.target.value)}
        >
          <option value="">Định dạng</option>
          <option value="truyen-tranh">Truyện tranh</option>
          <option value="truyen-chu">Truyện chữ</option>
          <option value="light-novel">Light Novel</option>
        </select>

        <select 
          className="filter-select"
          value={filters.genre}
          onChange={(e) => handleFilterChange('genre', e.target.value)}
        >
          <option value="">Thể loại</option>
          <option value="van-hoc">Văn học</option>
          <option value="khoa-hoc">Khoa học</option>
          <option value="lich-su">Lịch sử</option>
          <option value="kinh-te">Kinh tế</option>
          <option value="cong-nghe">Công nghệ</option>
          <option value="tam-ly">Tâm lý</option>
        </select>

        <select 
          className="filter-select"
          value={filters.author}
          onChange={(e) => handleFilterChange('author', e.target.value)}
        >
          <option value="">Tác giả</option>
          <option value="nguyen-nhat-anh">Nguyễn Nhật Ánh</option>
          <option value="paulo-coelho">Paulo Coelho</option>
          <option value="dale-carnegie">Dale Carnegie</option>
        </select>

        <select 
          className="filter-select"
          value={filters.year}
          onChange={(e) => handleFilterChange('year', e.target.value)}
        >
          <option value="">Năm</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>

        <button className="btn-filter" onClick={handleSearch}>
          Lọc truyện
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
