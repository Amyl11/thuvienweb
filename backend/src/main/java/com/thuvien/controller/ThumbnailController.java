package com.thuvien.controller;

import com.thuvien.entity.Book;
import com.thuvien.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/thumbnails")
@CrossOrigin(origins = "*")
public class ThumbnailController {

    private static final String THUMBNAIL_DIR = "D:\\thumbnails";
    
    @Autowired
    private BookService bookService;

    @GetMapping("/{filename}")
    public ResponseEntity<?> getThumbnail(@PathVariable String filename) {
        try {
            // Extract book ID from filename (e.g., "book_10.jpg" -> 10)
            String idStr = filename.replaceAll("[^0-9]", "");
            if (!idStr.isEmpty()) {
                Long bookId = Long.parseLong(idStr);
                Book book = bookService.getBookById(bookId).orElse(null);
                
                if (book != null && book.getThumbnailPath() != null) {
                    // If thumbnail is a Drive URL, proxy it
                    if (book.getThumbnailPath().startsWith("http")) {
                        try {
                            // Convert /preview to /view for direct image access
                            String imageUrl = book.getThumbnailPath().replace("/preview", "/view");
                            URL url = new URL(imageUrl);
                            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                            connection.setRequestMethod("GET");
                            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
                            
                            InputStream inputStream = connection.getInputStream();
                            byte[] imageBytes = inputStream.readAllBytes();
                            inputStream.close();
                            
                            return ResponseEntity.ok()
                                    .contentType(MediaType.IMAGE_JPEG)
                                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                                    .body(imageBytes);
                        } catch (Exception ex) {
                            ex.printStackTrace();
                            return ResponseEntity.notFound().build();
                        }
                    }
                }
            }
            
            // For local files, serve from filesystem
            Path filePath = Paths.get(THUMBNAIL_DIR, filename);
            File file = filePath.toFile();

            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
