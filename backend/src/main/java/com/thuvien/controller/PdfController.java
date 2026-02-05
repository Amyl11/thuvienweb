package com.thuvien.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.thuvien.service.BookService;
import com.thuvien.entity.Book;

import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class PdfController {

    private final BookService bookService;

    public PdfController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<?> getPdf(@PathVariable Long id) {
        try {
            Book book = bookService.getBookById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found"));

            if (book.getBookPath() == null || book.getBookPath().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // If bookPath is a Drive URL, redirect to it
            if (book.getBookPath().startsWith("http")) {
                return ResponseEntity.status(HttpStatus.FOUND)
                        .location(URI.create(book.getBookPath()))
                        .build();
            }

            // For local files, serve from filesystem
            Path filePath = Paths.get(book.getBookPath());
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/pdf";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long id) {
        try {
            Book book = bookService.getBookById(id)
                    .orElseThrow(() -> new RuntimeException("Book not found"));

            if (book.getBookPath() == null || book.getBookPath().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(book.getBookPath());
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/pdf";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + book.getName() + ".pdf\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
