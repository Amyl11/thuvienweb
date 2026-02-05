package com.thuvien.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleDriveService {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String APPLICATION_NAME = "ThuVien App";
    
    @Value("${google.drive.credentials.path:src/main/resources/credentials.json}")
    private String credentialsPath;
    
    @Value("${google.drive.folder.id:}")
    private String folderId;

    private Drive driveService;

    /**
     * Initialize Google Drive service with credentials
     */
    private Drive getDriveService() throws IOException, GeneralSecurityException {
        if (driveService == null) {
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            
            GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream(credentialsPath))
                .createScoped(Collections.singletonList("https://www.googleapis.com/auth/drive.file"));
            
            driveService = new Drive.Builder(
                httpTransport,
                JSON_FACTORY,
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();
        }
        return driveService;
    }

    /**
     * Upload file to Google Drive
     * @param multipartFile File to upload
     * @param fileName Desired file name
     * @return Public view link to the file
     */
    public String uploadFile(MultipartFile multipartFile, String fileName) throws IOException, GeneralSecurityException {
        // Save multipart file to temp location first
        Path tempFile = Files.createTempFile("upload-", fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile.toFile())) {
            fos.write(multipartFile.getBytes());
        }

        return uploadFile(tempFile.toFile(), fileName);
    }

    /**
     * Upload file to Google Drive
     * @param file File to upload
     * @param fileName Desired file name
     * @return Public view link to the file
     */
    public String uploadFile(java.io.File file, String fileName) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();

        // File metadata
        File fileMetadata = new File();
        fileMetadata.setName(fileName);
        
        // Set parent folder if specified
        if (folderId != null && !folderId.isEmpty()) {
            fileMetadata.setParents(Collections.singletonList(folderId));
        }

        // Determine MIME type
        String mimeType = Files.probeContentType(file.toPath());
        if (mimeType == null) {
            if (fileName.toLowerCase().endsWith(".pdf")) {
                mimeType = "application/pdf";
            } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                mimeType = "image/jpeg";
            } else if (fileName.toLowerCase().endsWith(".png")) {
                mimeType = "image/png";
            } else {
                mimeType = "application/octet-stream";
            }
        }

        FileContent mediaContent = new FileContent(mimeType, file);

        // Upload file with supportsAllDrives for Shared Drive support
        File uploadedFile = service.files().create(fileMetadata, mediaContent)
                .setSupportsAllDrives(true)
                .setFields("id, webViewLink, webContentLink")
                .execute();

        // Make file publicly readable
        makePublic(uploadedFile.getId());

        // Clean up temp file if it was created
        if (file.getPath().contains("upload-")) {
            file.delete();
        }

        // Return direct link for viewing
        return "https://drive.google.com/uc?export=view&id=" + uploadedFile.getId();
    }

    /**
     * Make a file publicly readable
     */
    private void makePublic(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        
        Permission permission = new Permission()
                .setType("anyone")
                .setRole("reader");
        
        service.permissions().create(fileId, permission)
                .setSupportsAllDrives(true)
                .execute();
    }

    /**
     * Delete file from Google Drive
     */
    public void deleteFile(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        service.files().delete(fileId)
                .setSupportsAllDrives(true)
                .execute();
    }

    /**
     * Extract file ID from Google Drive URL
     */
    public String extractFileId(String driveUrl) {
        if (driveUrl == null || driveUrl.isEmpty()) {
            return null;
        }
        
        // Pattern: https://drive.google.com/uc?export=view&id=FILE_ID
        if (driveUrl.contains("id=")) {
            String[] parts = driveUrl.split("id=");
            if (parts.length > 1) {
                return parts[1].split("&")[0];
            }
        }
        
        return null;
    }
}
