import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Book API
export const bookAPI = {
  // Lấy tất cả sách
  getAllBooks: () => api.get('/books'),
  
  // Lấy sách theo ID
  getBookById: (id) => api.get(`/books/${id}`),
  
  // Thêm sách mới
  createBook: (bookData) => api.post('/books', bookData),
  
  // Cập nhật sách
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  
  // Xóa sách
  deleteBook: (id) => api.delete(`/books/${id}`),
  
  // Tìm kiếm theo tên
  searchByName: (name) => api.get('/books/search/name', { params: { name } }),
  
  // Tìm kiếm theo tác giả
  searchByAuthor: (author) => api.get('/books/search/author', { params: { author } }),
  
  // Tìm kiếm theo thể loại
  searchByCategory: (category) => api.get('/books/search/category', { params: { category } }),
  
  // Tìm kiếm theo từ khóa
  searchByKeyword: (keyword) => api.get('/books/search', { params: { keyword } }),
  
  // Tăng lượt xem
  incrementViews: (id) => api.post(`/books/${id}/view`)
};

export default api;
