package com.thuvien.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;

@Service
public class ThumbnailService {

    private static final String THUMBNAIL_DIR = "D:\\thumbnails";
    private static final int THUMBNAIL_WIDTH = 300;
    private static final float DPI = 150;

    public ThumbnailService() {
        // Create thumbnail directory if not exists
        try {
            Files.createDirectories(Paths.get(THUMBNAIL_DIR));
        } catch (IOException e) {
            System.err.println("Failed to create thumbnail directory: " + e.getMessage());
        }
    }

    /**
     * Generate thumbnail from PDF and upload to Google Drive (OAuth version)
     * @param useLowQuality Use lower DPI for large files to reduce memory usage
     */
    public String generateThumbnailToDrive(String pdfPath, String thumbnailFileName, GoogleDriveOAuthService driveService, boolean useLowQuality) {
        if (pdfPath == null || pdfPath.trim().isEmpty()) {
            return null;
        }

        File pdfFile = new File(pdfPath);
        if (!pdfFile.exists()) {
            System.err.println("PDF file not found: " + pdfPath);
            return null;
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            if (document.getNumberOfPages() == 0) {
                System.err.println("PDF has no pages: " + pdfPath);
                return null;
            }

            // Only load and render the first page to save memory
            PDFRenderer renderer = new PDFRenderer(document);
            float dpi = useLowQuality ? 72 : DPI;
            
            // Render only page 0 (first page)
            BufferedImage image = renderer.renderImageWithDPI(0, dpi);
            
            // Resize to thumbnail size
            BufferedImage thumbnail = resizeImage(image, THUMBNAIL_WIDTH);
            
            // Release image memory
            image.flush();
            
            // Force garbage collection for large files
            if (useLowQuality) {
                System.gc();
            }

            // Save to temp file
            Path tempThumb = Files.createTempFile("thumb-", ".jpg");
            ImageIO.write(thumbnail, "jpg", tempThumb.toFile());
            
            // Release thumbnail memory
            thumbnail.flush();

            // Upload to Google Drive
            String driveUrl = driveService.uploadFile(tempThumb.toFile(), thumbnailFileName);

            // Clean up temp file
            Files.deleteIfExists(tempThumb);

            return driveUrl;

        } catch (IOException | GeneralSecurityException e) {
            System.err.println("Failed to generate thumbnail for: " + pdfPath);
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Generate thumbnail from PDF and upload to Google Drive
     * @param useLowQuality Use lower DPI for large files to reduce memory usage
     */
    public String generateThumbnailToDrive(String pdfPath, String thumbnailFileName, GoogleDriveService driveService, boolean useLowQuality) {
        if (pdfPath == null || pdfPath.trim().isEmpty()) {
            return null;
        }

        File pdfFile = new File(pdfPath);
        if (!pdfFile.exists()) {
            System.err.println("PDF file not found: " + pdfPath);
            return null;
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            if (document.getNumberOfPages() == 0) {
                System.err.println("PDF has no pages: " + pdfPath);
                return null;
            }

            // Only load and render the first page to save memory
            PDFRenderer renderer = new PDFRenderer(document);
            float dpi = useLowQuality ? 72 : DPI;
            
            // Render only page 0 (first page)
            BufferedImage image = renderer.renderImageWithDPI(0, dpi);
            
            // Resize to thumbnail size
            BufferedImage thumbnail = resizeImage(image, THUMBNAIL_WIDTH);
            
            // Release image memory
            image.flush();
            
            // Force garbage collection for large files
            if (useLowQuality) {
                System.gc();
            }

            // Save to temp file
            Path tempThumb = Files.createTempFile("thumb-", ".jpg");
            ImageIO.write(thumbnail, "jpg", tempThumb.toFile());
            
            // Release thumbnail memory
            thumbnail.flush();

            // Upload to Google Drive
            String driveUrl = driveService.uploadFile(tempThumb.toFile(), thumbnailFileName);

            // Clean up temp file
            Files.deleteIfExists(tempThumb);

            return driveUrl;

        } catch (IOException | GeneralSecurityException e) {
            System.err.println("Failed to generate thumbnail for: " + pdfPath);
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Generate thumbnail from PDF first page
     * @param pdfPath Full path to PDF file
     * @param bookId Book ID for thumbnail filename
     * @return Path to generated thumbnail, or null if failed
     */
    public String generateThumbnail(String pdfPath, Long bookId) {
        if (pdfPath == null || pdfPath.trim().isEmpty()) {
            return null;
        }

        File pdfFile = new File(pdfPath);
        if (!pdfFile.exists()) {
            System.err.println("PDF file not found: " + pdfPath);
            return null;
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            if (document.getNumberOfPages() == 0) {
                System.err.println("PDF has no pages: " + pdfPath);
                return null;
            }

            // Render first page
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(0, DPI);

            // Resize to thumbnail size
            BufferedImage thumbnail = resizeImage(image, THUMBNAIL_WIDTH);

            // Save thumbnail
            String thumbnailFileName = "book_" + bookId + ".jpg";
            Path thumbnailPath = Paths.get(THUMBNAIL_DIR, thumbnailFileName);
            ImageIO.write(thumbnail, "jpg", thumbnailPath.toFile());

            return thumbnailPath.toString();

        } catch (IOException e) {
            System.err.println("Failed to generate thumbnail for: " + pdfPath);
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Resize image maintaining aspect ratio
     */
    private BufferedImage resizeImage(BufferedImage originalImage, int targetWidth) {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        int targetHeight = (int) ((double) originalHeight / originalWidth * targetWidth);
        
        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        resizedImage.getGraphics().drawImage(
            originalImage.getScaledInstance(targetWidth, targetHeight, java.awt.Image.SCALE_SMOOTH),
            0, 0, null
        );
        
        return resizedImage;
    }

    /**
     * Delete thumbnail file
     */
    public void deleteThumbnail(String thumbnailPath) {
        if (thumbnailPath != null && !thumbnailPath.isEmpty()) {
            try {
                Files.deleteIfExists(Paths.get(thumbnailPath));
            } catch (IOException e) {
                System.err.println("Failed to delete thumbnail: " + thumbnailPath);
            }
        }
    }
}
