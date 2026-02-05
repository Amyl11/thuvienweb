import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI } from '../services/api';
import { historyStorage } from '../utils/historyStorage';
import { API_BASE_URL } from '../config/config';
import * as pdfjsLib from 'pdfjs-dist';
import './ReadPage.css';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const ReadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const hideTimerRef = useRef(null);
  const headerRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  useEffect(() => {
    if (book && book.bookPath) {
      loadPdfInfo();
    }
  }, [book]);

  useEffect(() => {
    // Listen for page changes via postMessage
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'pageChange') {
        setCurrentPage(event.data.page);
      }
    };

    window.addEventListener('message', handleMessage);

    // Polling to check iframe URL hash for page number
    const pollInterval = setInterval(() => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const iframeUrl = iframeRef.current.contentWindow.location.href;
          const match = iframeUrl.match(/#page=(\d+)/);
          if (match) {
            const page = parseInt(match[1], 10);
            if (page !== currentPage) {
              setCurrentPage(page);
            }
          }
        }
      } catch (e) {
        // Cross-origin restriction - cannot access iframe URL
      }
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [currentPage]);

  useEffect(() => {
    // Auto-hide header after 3 seconds
    const startHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setIsHeaderVisible(false);
      }, 3000);
    };

    // Show header on mouse move near top
    const handleMouseMove = (e) => {
      if (e.clientY < 80) {
        if (!isHeaderVisible) {
          setIsHeaderVisible(true);
        }
        startHideTimer();
      }
    };

    // Show header on mouse enter at top
    const handleMouseEnter = () => {
      setIsHeaderVisible(true);
      startHideTimer();
    };

    startHideTimer();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHeaderVisible]);

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

  const loadPdfInfo = async () => {
    try {
      const pdfUrl = `${API_BASE_URL}/api/books/${id}/pdf`;
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
    } catch (error) {
      console.error('Error loading PDF info:', error);
    }
  };

  if (loading) {
    return (
      <div className="read-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!book || !book.bookPath) {
    return (
      <div className="read-page">
        <div className="error">Không tìm thấy file PDF!</div>
      </div>
    );
  }

  return (
    <div className="read-page" 
         onMouseMove={(e) => {
           if (e.clientY < 80) {
             setIsHeaderVisible(true);
           }
         }}>
      <div className={`read-header ${isHeaderVisible ? 'visible' : 'hidden'}`} ref={headerRef}>
        <button className="btn-back-reader" onClick={() => navigate(`/sach/${id}`, { replace: true })}>
          ← Quay lại
        </button>
        <h1 className="book-title-reader">{book.name}</h1>
      </div>
      
      <div className="mouse-catcher" 
           onMouseMove={(e) => {
             if (e.clientY < 80) {
               setIsHeaderVisible(true);
             }
           }}
      />
      
      <div className="pdf-container">
        <iframe
          ref={iframeRef}
          src={book.bookPath.startsWith('http') 
            ? `https://drive.google.com/file/d/${book.bookPath.match(/id=([^&]+)/)?.[1]}/preview`
            : `${API_BASE_URL}/api/books/${id}/pdf#toolbar=0`}
          title={book.name}
          className="pdf-viewer"
        />
      </div>
    </div>
  );
};

export default ReadPage;
