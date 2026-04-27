package com.staffly.cv_service.service;

import com.staffly.cv_service.dto.request.ApplicationCreateRequestDto;
import com.staffly.cv_service.dto.response.ApplicationResponseDto;
import com.staffly.cv_service.entity.Application;
import com.staffly.cv_service.entity.JobPosting;
import com.staffly.cv_service.repository.ApplicationRepository;
import com.staffly.cv_service.repository.JobPostingRepository;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public ApplicationResponseDto createApplication(ApplicationCreateRequestDto request, MultipartFile cvFile) {
        try {
            JobPosting jobPosting = jobPostingRepository.findById(request.getJobPostingId())
                    .orElseThrow(() -> new RuntimeException("Job posting not found with id: " + request.getJobPostingId()));

            if (Boolean.TRUE.equals(jobPosting.getIsDeleted())) {
                throw new RuntimeException("Job posting is deleted");
            }

            if (!"ACTIVE".equals(jobPosting.getStatus())) {
                throw new RuntimeException("Job posting is not active");
            }

            if (jobPosting.getApplicationDeadline() != null &&
                    jobPosting.getApplicationDeadline().isBefore(LocalDate.now())) {
                throw new RuntimeException("Application deadline has passed");
            }

            if (cvFile == null || cvFile.isEmpty()) {
                throw new RuntimeException("CV file cannot be empty");
            }

            if (!"application/pdf".equals(cvFile.getContentType())) {
                throw new RuntimeException("Only PDF files are allowed");
            }

            if (cvFile.getSize() > 5242880) {
                throw new RuntimeException("CV file size cannot exceed 5MB");
            }

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

                    .jobPostingId(jobPosting.getId())

                    .positionId(jobPosting.getPositionId())
                    .departmentId(jobPosting.getDepartmentId())
                    .subDepartmentId(jobPosting.getSubDepartmentId())

                    .departmentName(jobPosting.getDepartmentName())
                    .subDepartmentName(jobPosting.getSubDepartmentName())
                    .positionName(jobPosting.getPositionName())

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

    public List<ApplicationResponseDto> getApplicationsByJobPosting(Long jobPostingId) {
        return applicationRepository.findByJobPostingId(jobPostingId)
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

        if (!List.of("PENDING", "IN_REVIEW", "ACCEPTED", "REJECTED").contains(status)) {
            throw new RuntimeException("Invalid application status: " + status);
        }

        application.setStatus(status);

        if ("ACCEPTED".equals(status) || "REJECTED".equals(status)) {
            application.setIsReviewed(true);
            application.setReviewedAt(LocalDateTime.now());
        }

        Application updated = applicationRepository.save(application);

        return mapToResponse(updated);
    }

    private ApplicationResponseDto mapToResponse(Application app) {
        String jobPostingTitle = jobPostingRepository.findById(app.getJobPostingId())
                .map(JobPosting::getTitle)
                .orElse(null);

        return ApplicationResponseDto.builder()
                .id(app.getId())
                .firstName(app.getFirstName())
                .lastName(app.getLastName())
                .email(app.getEmail())
                .phone(app.getPhone())

                .jobPostingId(app.getJobPostingId())
                .jobPostingTitle(jobPostingTitle)

                .departmentId(app.getDepartmentId())
                .subDepartmentId(app.getSubDepartmentId())
                .positionId(app.getPositionId())

                .departmentName(app.getDepartmentName())
                .subDepartmentName(app.getSubDepartmentName())
                .positionName(app.getPositionName())

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