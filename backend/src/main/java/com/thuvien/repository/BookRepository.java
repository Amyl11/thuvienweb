package com.thuvien.repository;

import com.thuvien.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Tìm sách theo tên
    List<Book> findByNameContainingIgnoreCase(String name);
    
    // Tìm sách theo tác giả
    List<Book> findByAuthorContainingIgnoreCase(String author);
    
    // Tìm sách theo thể loại
    List<Book> findByCategoryContainingIgnoreCase(String category);
    
    // Tìm sách theo tên hoặc tác giả
    List<Book> findByNameContainingIgnoreCaseOrAuthorContainingIgnoreCase(String name, String author);
}
