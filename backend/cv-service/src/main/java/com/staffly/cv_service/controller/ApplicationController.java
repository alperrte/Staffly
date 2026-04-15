package com.staffly.cv_service.controller;

import com.staffly.cv_service.dto.request.ApplicationCreateRequestDto;
import com.staffly.cv_service.dto.response.ApplicationResponseDto;
import com.staffly.cv_service.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponseDto> createApplication(
            @Valid @ModelAttribute ApplicationCreateRequestDto request,
            @RequestPart("cvFile") MultipartFile cvFile
    ) {
        return ResponseEntity.ok(applicationService.createApplication(request, cvFile));
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponseDto>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponseDto> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<ApplicationResponseDto>> getApplicationsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(applicationService.getApplicationsByEmail(email));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ApplicationResponseDto>> getApplicationsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(applicationService.getApplicationsByStatus(status));
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<Resource> getApplicationCv(@PathVariable Long id) {
        return applicationService.getApplicationCv(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDto> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }
}