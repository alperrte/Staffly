package com.staffly.cv_service.controller;

import com.staffly.cv_service.dto.request.JobPostingCreateRequestDto;
import com.staffly.cv_service.dto.response.JobPostingResponseDto;
import com.staffly.cv_service.service.JobPostingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobPostingService;

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PostMapping
    public ResponseEntity<JobPostingResponseDto> createJobPosting(
            @Valid @RequestBody JobPostingCreateRequestDto request
    ) {
        return ResponseEntity.ok(jobPostingService.createJobPosting(request));
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @GetMapping
    public ResponseEntity<List<JobPostingResponseDto>> getAllJobPostings() {
        return ResponseEntity.ok(jobPostingService.getAllJobPostings());
    }

    @GetMapping("/public/active")
    public ResponseEntity<List<JobPostingResponseDto>> getActiveJobPostings() {
        return ResponseEntity.ok(jobPostingService.getActiveJobPostings());
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<JobPostingResponseDto> getJobPostingById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.getJobPostingById(id));
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PatchMapping("/{id}/close")
    public ResponseEntity<JobPostingResponseDto> closeJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.closeJobPosting(id));
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PatchMapping("/{id}/activate")
    public ResponseEntity<JobPostingResponseDto> activateJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.activateJobPosting(id));
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        jobPostingService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<JobPostingResponseDto> updateJobPosting(
            @PathVariable Long id,
            @Valid @RequestBody JobPostingCreateRequestDto request
    ) {
        return ResponseEntity.ok(jobPostingService.updateJobPosting(id, request));
    }
}