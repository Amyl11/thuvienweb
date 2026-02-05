package com.thuvien.service;

import com.thuvien.entity.Book;
import com.thuvien.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ThumbnailService thumbnailService;

    @Autowired(required = false)
    private GoogleDriveService googleDriveService;

    @Autowired(required = false)
    private GoogleDriveOAuthService googleDriveOAuthService;

    @Value("${google.drive.enabled:false}")
    private boolean googleDriveEnabled;

    @Value("${google.drive.use.oauth:true}")
    private boolean useOAuth;

    // Upload directory (for local storage)
    private static final String UPLOAD_DIR = "D:\\uploaded_books\\";

    static {
        // Create upload directory if not exists
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    // Lấy tất cả sách
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // Lấy sách theo ID
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    // Thêm sách mới
    public Book createBook(Book book) {
        // Save book first to get ID
        Book savedBook = bookRepository.save(book);
        
        // Generate thumbnail if PDF path exists
        if (savedBook.getBookPath() != null && !savedBook.getBookPath().isEmpty()) {
            String thumbnailPath = thumbnailService.generateThumbnail(
                savedBook.getBookPath(), 
                savedBook.getId()
            );
            if (thumbnailPath != null) {
                savedBook.setThumbnailPath(thumbnailPath);
                savedBook = bookRepository.save(savedBook);
            }
        }
        
        return savedBook;
    }

    // Upload sách với file PDF
    public Book uploadBook(MultipartFile pdfFile, String name, String author, String category) throws IOException {
        try {
            String sanitizedName = name.replaceAll("[^a-zA-Z0-9\\s\\-_]", "")
                                       .replaceAll("\\s+", "-");
            String timestamp = String.valueOf(System.currentTimeMillis());
            String filename = sanitizedName + "_" + timestamp + ".pdf";
            
            String bookPath;
            String thumbnailPath;
            
            if (googleDriveEnabled) {
                // Choose OAuth or Service Account
                Object driveService = useOAuth ? googleDriveOAuthService : googleDriveService;
                
                // Upload to Google Drive
                if (useOAuth) {
                    bookPath = googleDriveOAuthService.uploadFile(pdfFile, filename);
                } else {
                    bookPath = googleDriveService.uploadFile(pdfFile, filename);
                }
                
                // Generate thumbnail and upload to Drive
                // Skip thumbnail for large files (> 25MB) to avoid memory issues
                if (pdfFile.getSize() > 25 * 1024 * 1024) {
                    System.out.println("File size > 25MB, skipping thumbnail generation");
                    thumbnailPath = "NULL";
                } else {
                    Path tempPdfPath = Files.createTempFile("temp-pdf-", ".pdf");
                    Files.copy(pdfFile.getInputStream(), tempPdfPath, StandardCopyOption.REPLACE_EXISTING);
                    
                    try {
                        if (useOAuth) {
                            thumbnailPath = thumbnailService.generateThumbnailToDrive(
                                tempPdfPath.toString(), 
                                sanitizedName + "_" + timestamp + "_thumb.jpg",
                                googleDriveOAuthService
                            );
                        } else {
                            thumbnailPath = thumbnailService.generateThumbnailToDrive(
                                tempPdfPath.toString(), 
                                sanitizedName + "_" + timestamp + "_thumb.jpg",
                                googleDriveService
                            );
                        }
                        
                        // If thumbnail generation failed, set to NULL
                        if (thumbnailPath == null) {
                            thumbnailPath = "NULL";
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to generate thumbnail: " + e.getMessage());
                        thumbnailPath = "NULL";
                    } finally {
                        // Clean up temp file
                        Files.deleteIfExists(tempPdfPath);
                    }
                }
            } else {
                // Save to local directory
                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.copy(pdfFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                bookPath = filePath.toString();
                
                // Generate thumbnail locally (will be done after save)
                thumbnailPath = null;
            }
            
            // Create book entity
            Book book = new Book();
            book.setName(name);
            book.setAuthor(author);
            book.setCategory(category);
            book.setBookPath(bookPath);
            book.setViews(0L);
            
            // Save book to get ID
            Book savedBook = bookRepository.save(book);
            
            // Generate thumbnail for local storage
            if (!googleDriveEnabled) {
                thumbnailPath = thumbnailService.generateThumbnail(
                    savedBook.getBookPath(), 
                    savedBook.getId()
                );
            }
            
            if (thumbnailPath != null) {
                savedBook.setThumbnailPath(thumbnailPath);
                savedBook = bookRepository.save(savedBook);
            }
            
            return savedBook;
        } catch (GeneralSecurityException e) {
            throw new IOException("Google Drive error: " + e.getMessage(), e);
        }
    }

    // Cập nhật sách
    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        
        book.setName(bookDetails.getName());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        book.setBookPath(bookDetails.getBookPath());
        
        return bookRepository.save(book);
    }

    // Xóa sách
    public void deleteBook(Long id) {
        Optional<Book> book = bookRepository.findById(id);
        if (book.isPresent() && book.get().getThumbnailPath() != null) {
            // Delete thumbnail file
            thumbnailService.deleteThumbnail(book.get().getThumbnailPath());
        }
        bookRepository.deleteById(id);
    }

    // Tìm kiếm sách theo tên
    public List<Book> searchByName(String name) {
        return bookRepository.findByNameContainingIgnoreCase(name);
    }

    // Tìm kiếm sách theo tác giả
    public List<Book> searchByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    // Tìm kiếm sách theo thể loại
    public List<Book> searchByCategory(String category) {
        return bookRepository.findByCategoryContainingIgnoreCase(category);
    }

    // Tìm kiếm sách theo từ khóa (tên hoặc tác giả)
    public List<Book> searchByKeyword(String keyword) {
        return bookRepository.findByNameContainingIgnoreCaseOrAuthorContainingIgnoreCase(keyword, keyword);
    }

    // Tăng lượt xem
    public Book incrementViews(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setViews(book.getViews() + 1);
        return bookRepository.save(book);
    }

    // Regenerate thumbnail for existing book
    public Book regenerateThumbnail(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        
        if (book.getBookPath() != null && !book.getBookPath().isEmpty()) {
            // Delete old thumbnail if exists
            if (book.getThumbnailPath() != null) {
                thumbnailService.deleteThumbnail(book.getThumbnailPath());
            }
            
            // Generate new thumbnail
            String thumbnailPath = thumbnailService.generateThumbnail(
                book.getBookPath(), 
                book.getId()
            );
            
            if (thumbnailPath != null) {
                book.setThumbnailPath(thumbnailPath);
                return bookRepository.save(book);
            }
        }
        
        return book;
    }
}
