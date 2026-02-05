import { useState } from 'react';
import { bookAPI } from '../services/api';
import { CATEGORIES } from '../constants/categories';
import { API_BASE_URL } from '../config/config';
import './AddBookPage.css';

const AddBookPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    category: []
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setMessage({ type: '', text: '' });
    } else if (file) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file PDF!' });
      e.target.value = '';
    }
  };

  const handleCategoryChange = (categoryLabel) => {
    setFormData(prev => {
      const currentCategories = prev.category;
      if (currentCategories.includes(categoryLabel)) {
        return { ...prev, category: currentCategories.filter(c => c !== categoryLabel) };
      } else {
        return { ...prev, category: [...currentCategories, categoryLabel] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.author || formData.category.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    if (!pdfFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file PDF để upload!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setUploadProgress(0);

    try {
      // Upload file with progress tracking
      const formDataToSend = new FormData();
      formDataToSend.append('pdfFile', pdfFile);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('category', formData.category.join(', '));

      // Use XMLHttpRequest for progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        // Send request
        xhr.open('POST', `${API_BASE_URL}/api/books/upload`);
        xhr.send(formDataToSend);
      });

      setMessage({ type: 'success', text: 'Upload và thêm sách thành công!' });

      // Reset form
      setFormData({
        name: '',
        author: '',
        category: []
      });
      setPdfFile(null);
      setUploadProgress(0);
      const fileInput = document.getElementById('pdfFileInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error adding book:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi thêm sách!' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="add-book-page">
      <div className="container">
        <div className="page-header">
          <h1>THÊM SÁCH MỚI</h1>
          <p>Điền thông tin sách để thêm vào thư viện</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="add-book-form">
            <div className="form-group">
              <label htmlFor="name">Tên sách <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên sách..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Tác giả <span className="required">*</span></label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Nhập tên tác giả..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Thể loại <span className="required">*</span></label>
              <small className="form-hint">Chọn một hoặc nhiều thể loại cho sách</small>
              <div className="category-checkbox-grid">
                {CATEGORIES.map(category => (
                  <label key={category.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={category.label}
                      checked={formData.category.includes(category.label)}
                      onChange={() => handleCategoryChange(category.label)}
                    />
                    <span className="checkbox-label">{category.label}</span>
                  </label>
                ))}
              </div>
              {formData.category.length > 0 && (
                <div className="selected-categories">
                  <strong>Đã chọn:</strong> {formData.category.join(', ')}
                </div>
              )}
            </div>

            {/* File Upload Input */}
            <div className="form-group">
              <label htmlFor="pdfFileInput">Chọn file PDF <span className="required">*</span></label>
              <input
                type="file"
                id="pdfFileInput"
                accept=".pdf"
                onChange={handleFileChange}
              />
              {pdfFile && (
                <div className="file-selected">
                  <small>Đã chọn: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</small>
                </div>
              )}
              
              {/* Upload Progress Bar */}
              {loading && uploadProgress > 0 && (
                <div className="upload-progress">
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Thêm sách'}
              </button>
              <button 
                type="button" 
                className="btn-reset" 
                onClick={() => setFormData({ name: '', author: '', category: [] })}
                disabled={loading}
              >
                Đặt lại
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;
