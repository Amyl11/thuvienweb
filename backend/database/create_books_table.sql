-- ===================================================
-- Database Schema for ThuVien (Library Management System)
-- Simple Book Table with PDF Support
-- ===================================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS thuvien_db;
CREATE DATABASE thuvien_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE thuvien_db;

-- ===================================================
-- Table: Books (Sách)
-- ===================================================
CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    author VARCHAR(200),
    category VARCHAR(100),
    book_path VARCHAR(500),
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_author (author),
    INDEX idx_category (category),
    INDEX idx_views (views)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================
-- Query Examples
-- ===================================================

-- Lấy tất cả sách
-- SELECT * FROM books;

-- Tìm sách theo tên
-- SELECT * FROM books WHERE name LIKE '%Mắt Biếc%';

-- Tìm sách theo tác giả
-- SELECT * FROM books WHERE author = 'Nguyễn Nhật Ánh';

-- Tìm sách theo thể loại
-- SELECT * FROM books WHERE category = 'Văn học';

-- Cập nhật đường dẫn file PDF
-- UPDATE books SET book_path = '/uploads/pdfs/new_path.pdf' WHERE id = 1;

-- Xóa sách
-- DELETE FROM books WHERE id = 1;

-- ===================================================
-- End of Database Schema
-- ===================================================
