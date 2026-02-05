package com.thuvien.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.Permission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleDriveOAuthService {

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final String APPLICATION_NAME = "ThuVien App";
    private static final List<String> SCOPES = Collections.singletonList(DriveScopes.DRIVE_FILE);
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    
    @Value("${google.drive.oauth.credentials.path:src/main/resources/oauth_credentials.json}")
    private String oauthCredentialsPath;
    
    @Value("${google.drive.folder.id:}")
    private String folderId;

    private Drive driveService;

    /**
     * Creates an authorized Credential object using OAuth 2.0
     */
    private Credential getCredentials(HttpTransport httpTransport) throws IOException {
        // Load client secrets
        GoogleClientSecrets clientSecrets;
        try (InputStreamReader reader = new InputStreamReader(new FileInputStream(oauthCredentialsPath))) {
            clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, reader);
        }

        // Build flow and trigger user authorization request
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();
        
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
        return new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");
    }

    /**
     * Initialize Google Drive service with OAuth credentials
     */
    private Drive getDriveService() throws IOException, GeneralSecurityException {
        if (driveService == null) {
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            Credential credential = getCredentials(httpTransport);
            
            driveService = new Drive.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
        }
        return driveService;
    }

    /**
     * Upload file to Google Drive (My Drive)
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

        // Upload file
        File uploadedFile = service.files().create(fileMetadata, mediaContent)
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
        
        service.permissions().create(fileId, permission).execute();
    }

    /**
     * Delete file from Google Drive
     */
    public void deleteFile(String fileId) throws IOException, GeneralSecurityException {
        Drive service = getDriveService();
        service.files().delete(fileId).execute();
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
