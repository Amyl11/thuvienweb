-- Add thumbnail_path column to books table
ALTER TABLE books ADD COLUMN thumbnail_path VARCHAR(500) AFTER book_path;
