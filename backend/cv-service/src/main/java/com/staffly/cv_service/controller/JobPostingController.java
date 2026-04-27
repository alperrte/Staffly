package com.staffly.cv_service.controller;

import com.staffly.cv_service.dto.request.JobPostingCreateRequestDto;
import com.staffly.cv_service.dto.response.JobPostingResponseDto;
import com.staffly.cv_service.service.JobPostingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobPostingService;

    @PostMapping
    public ResponseEntity<JobPostingResponseDto> createJobPosting(
            @Valid @RequestBody JobPostingCreateRequestDto request
    ) {
        return ResponseEntity.ok(jobPostingService.createJobPosting(request));
    }

    @GetMapping
    public ResponseEntity<List<JobPostingResponseDto>> getAllJobPostings() {
        return ResponseEntity.ok(jobPostingService.getAllJobPostings());
    }

    @GetMapping("/public/active")
    public ResponseEntity<List<JobPostingResponseDto>> getActiveJobPostings() {
        return ResponseEntity.ok(jobPostingService.getActiveJobPostings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostingResponseDto> getJobPostingById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.getJobPostingById(id));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<JobPostingResponseDto> closeJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.closeJobPosting(id));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<JobPostingResponseDto> activateJobPosting(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.activateJobPosting(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        jobPostingService.deleteJobPosting(id);
        return ResponseEntity.noContent().build();
    }
}