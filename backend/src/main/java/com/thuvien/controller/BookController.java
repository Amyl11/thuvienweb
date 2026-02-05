package com.thuvien.controller;

import com.thuvien.entity.Book;
import com.thuvien.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    // Lấy tất cả sách
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    // Lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm sách mới
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Book createdBook = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

    // Upload sách với file PDF
    @PostMapping("/upload")
    public ResponseEntity<?> uploadBook(
            @RequestParam("pdfFile") MultipartFile pdfFile,
            @RequestParam("name") String name,
            @RequestParam("author") String author,
            @RequestParam("category") String category) {
        try {
            // Validate file
            if (pdfFile.isEmpty()) {
                return ResponseEntity.badRequest().body("File PDF không được để trống");
            }
            
            if (!pdfFile.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
                return ResponseEntity.badRequest().body("Chỉ chấp nhận file PDF");
            }

            // Call service to handle upload
            Book createdBook = bookService.uploadBook(pdfFile, name, author, category);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi upload file: " + e.getMessage());
        }
    }

    // Cập nhật sách
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        try {
            Book updatedBook = bookService.updateBook(id, bookDetails);
            return ResponseEntity.ok(updatedBook);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Xóa sách
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // Tìm kiếm sách theo tên
    @GetMapping("/search/name")
    public ResponseEntity<List<Book>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(bookService.searchByName(name));
    }

    // Tìm kiếm sách theo tác giả
    @GetMapping("/search/author")
    public ResponseEntity<List<Book>> searchByAuthor(@RequestParam String author) {
        return ResponseEntity.ok(bookService.searchByAuthor(author));
    }

    // Tìm kiếm sách theo thể loại
    @GetMapping("/search/category")
    public ResponseEntity<List<Book>> searchByCategory(@RequestParam String category) {
        return ResponseEntity.ok(bookService.searchByCategory(category));
    }

    // Tìm kiếm sách theo từ khóa
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchByKeyword(@RequestParam String keyword) {
        return ResponseEntity.ok(bookService.searchByKeyword(keyword));
    }

    // Tăng lượt xem
    @PostMapping("/{id}/view")
    public ResponseEntity<Book> incrementViews(@PathVariable Long id) {
        try {
            Book book = bookService.incrementViews(id);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Regenerate thumbnail for existing book
    @PostMapping("/{id}/regenerate-thumbnail")
    public ResponseEntity<Book> regenerateThumbnail(@PathVariable Long id) {
        try {
            Book book = bookService.regenerateThumbnail(id);
            return ResponseEntity.ok(book);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
