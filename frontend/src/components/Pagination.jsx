import { useState } from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, scrollRef }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePageClick = () => {
    setIsEditing(true);
    setInputValue(currentPage.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputSubmit = () => {
    const pageNumber = parseInt(inputValue, 10);
    
    // Validate số trang
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
      if (scrollRef?.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    
    setIsEditing(false);
    setInputValue('');
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue('');
    }
  };

  const handleInputBlur = () => {
    handleInputSubmit();
  };

  return (
    <div className="pagination">
      <button 
        className="btn-page" 
        onClick={handleFirst}
        disabled={currentPage === 1}
        title="Trang đầu"
      >
        ⇤ Đầu
      </button>

      <button 
        className="btn-page" 
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        ← Trước
      </button>
      
      {isEditing ? (
        <div className="page-input-wrapper">
          <input
            type="text"
            className="page-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            autoFocus
            placeholder={`1-${totalPages}`}
          />
          <span className="page-total">/ {totalPages}</span>
        </div>
      ) : (
        <span 
          className="page-info clickable" 
          onClick={handlePageClick}
          title="Click để nhập số trang"
        >
          Trang {currentPage} / {totalPages}
        </span>
      )}
      
      <button 
        className="btn-page" 
        onClick={handleNext}
        disabled={currentPage >= totalPages}
      >
        Sau →
      </button>

      <button 
        className="btn-page" 
        onClick={handleLast}
        disabled={currentPage >= totalPages}
        title="Trang cuối"
      >
        Cuối ⇥
      </button>
    </div>
  );
};

export default Pagination;
