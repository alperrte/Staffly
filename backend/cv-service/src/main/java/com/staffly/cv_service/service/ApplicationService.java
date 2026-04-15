package com.staffly.cv_service.service;

import com.staffly.cv_service.dto.request.ApplicationCreateRequestDto;
import com.staffly.cv_service.dto.response.ApplicationResponseDto;
import com.staffly.cv_service.entity.Application;
import com.staffly.cv_service.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ApplicationResponseDto createApplication(ApplicationCreateRequestDto request, MultipartFile cvFile) {
        try {
            String originalFileName = cvFile.getOriginalFilename();
            String storedFileName = UUID.randomUUID() + "_" + originalFileName;

            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            File destination = new File(directory, storedFileName);
            cvFile.transferTo(destination);

            Application application = Application.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phone(request.getPhone())
                    .department(request.getDepartment())
                    .position(request.getPosition())
                    .cvOriginalFileName(originalFileName)
                    .cvStoredFileName(storedFileName)
                    .cvFilePath(destination.getAbsolutePath())
                    .cvContentType(cvFile.getContentType())
                    .cvFileSize(cvFile.getSize())
                    .build();

            Application saved = applicationRepository.save(application);

            return mapToResponse(saved);

        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }

    public List<ApplicationResponseDto> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ApplicationResponseDto getApplicationById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        return mapToResponse(application);
    }

    public List<ApplicationResponseDto> getApplicationsByEmail(String email) {
        return applicationRepository.findByEmail(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ApplicationResponseDto> getApplicationsByStatus(String status) {
        return applicationRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ResponseEntity<Resource> getApplicationCv(Long id) {
        try {
            Application application = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

            Path filePath = Path.of(application.getCvFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("CV file not found or not readable");
            }

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + application.getCvOriginalFileName() + "\""
                    )
                    .contentType(MediaType.parseMediaType(application.getCvContentType()))
                    .body(resource);

        } catch (MalformedURLException e) {
            throw new RuntimeException("Error while reading CV file", e);
        }
    }

    public ApplicationResponseDto updateApplicationStatus(Long id, String status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        application.setStatus(status);
        application.setIsReviewed(true);
        application.setReviewedAt(LocalDateTime.now());

        Application updated = applicationRepository.save(application);

        return mapToResponse(updated);
    }

    private ApplicationResponseDto mapToResponse(Application app) {
        return ApplicationResponseDto.builder()
                .id(app.getId())
                .firstName(app.getFirstName())
                .lastName(app.getLastName())
                .email(app.getEmail())
                .phone(app.getPhone())
                .department(app.getDepartment())
                .position(app.getPosition())
                .cvOriginalFileName(app.getCvOriginalFileName())
                .cvStoredFileName(app.getCvStoredFileName())
                .cvFilePath(app.getCvFilePath())
                .cvContentType(app.getCvContentType())
                .cvFileSize(app.getCvFileSize())
                .status(app.getStatus())
                .isReviewed(app.getIsReviewed())
                .appliedAt(app.getAppliedAt())
                .reviewedAt(app.getReviewedAt())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}