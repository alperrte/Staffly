package com.staffly.cv_service.service;

import com.staffly.cv_service.client.DepartmentClient;
import com.staffly.cv_service.dto.request.JobPostingCreateRequestDto;
import com.staffly.cv_service.dto.response.JobPostingResponseDto;
import com.staffly.cv_service.entity.JobPosting;
import com.staffly.cv_service.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final DepartmentClient departmentClient;

    public JobPostingResponseDto createJobPosting(JobPostingCreateRequestDto request) {

        Map<String, Object> position = departmentClient.getPosition(request.getPositionId());

        if (position == null) {
            throw new RuntimeException("Position not found");
        }

        Long subDepartmentId = Long.valueOf(position.get("subDepartmentId").toString());

        Map<String, Object> subDepartment = departmentClient.getSubDepartment(subDepartmentId);

        if (subDepartment == null) {
            throw new RuntimeException("Sub department not found");
        }

        Long departmentId = Long.valueOf(subDepartment.get("departmentId").toString());

        Map<String, Object> department = departmentClient.getDepartment(departmentId);

        if (department == null) {
            throw new RuntimeException("Department not found");
        }

        JobPosting jobPosting = JobPosting.builder()
                .title(request.getTitle())
                .description(request.getDescription())

                .positionId(request.getPositionId())
                .subDepartmentId(subDepartmentId)
                .departmentId(departmentId)

                .positionName(String.valueOf(position.get("name")))
                .subDepartmentName(String.valueOf(subDepartment.get("name")))
                .departmentName(String.valueOf(department.get("name")))

                .experienceLevel(request.getExperienceLevel())
                .employmentType(request.getEmploymentType())
                .workModel(request.getWorkModel())
                .location(request.getLocation())

                .requirements(request.getRequirements())
                .responsibilities(request.getResponsibilities())
                .benefits(request.getBenefits())
                .teamInfo(request.getTeamInfo())

                .status(request.getStatus() == null ? "ACTIVE" : request.getStatus())
                .applicationDeadline(request.getApplicationDeadline())
                .isDeleted(false)
                .build();

        JobPosting saved = jobPostingRepository.save(jobPosting);

        return mapToResponse(saved);
    }

    public List<JobPostingResponseDto> getAllJobPostings() {
        return jobPostingRepository.findByIsDeletedFalse()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<JobPostingResponseDto> getActiveJobPostings() {
        return jobPostingRepository
                .findByStatusAndIsDeletedFalseOrderByCreatedAtDesc("ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public JobPostingResponseDto getJobPostingById(Long id) {
        JobPosting jobPosting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found with id: " + id));

        if (Boolean.TRUE.equals(jobPosting.getIsDeleted())) {
            throw new RuntimeException("Job posting is deleted");
        }

        return mapToResponse(jobPosting);
    }

    public JobPostingResponseDto closeJobPosting(Long id) {
        JobPosting jobPosting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found with id: " + id));

        jobPosting.setStatus("CLOSED");
        jobPosting.setClosedAt(LocalDateTime.now());

        JobPosting updated = jobPostingRepository.save(jobPosting);

        return mapToResponse(updated);
    }

    public JobPostingResponseDto activateJobPosting(Long id) {
        JobPosting jobPosting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found with id: " + id));

        jobPosting.setStatus("ACTIVE");
        jobPosting.setClosedAt(null);

        JobPosting updated = jobPostingRepository.save(jobPosting);

        return mapToResponse(updated);
    }

    public void deleteJobPosting(Long id) {
        JobPosting jobPosting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job posting not found with id: " + id));

        jobPosting.setIsDeleted(true);
        jobPostingRepository.save(jobPosting);
    }

    private JobPostingResponseDto mapToResponse(JobPosting jobPosting) {
        return JobPostingResponseDto.builder()
                .id(jobPosting.getId())

                .title(jobPosting.getTitle())
                .description(jobPosting.getDescription())

                .departmentId(jobPosting.getDepartmentId())
                .subDepartmentId(jobPosting.getSubDepartmentId())
                .positionId(jobPosting.getPositionId())

                .departmentName(jobPosting.getDepartmentName())
                .subDepartmentName(jobPosting.getSubDepartmentName())
                .positionName(jobPosting.getPositionName())

                .experienceLevel(jobPosting.getExperienceLevel())
                .employmentType(jobPosting.getEmploymentType())
                .workModel(jobPosting.getWorkModel())
                .location(jobPosting.getLocation())

                .requirements(jobPosting.getRequirements())
                .responsibilities(jobPosting.getResponsibilities())
                .benefits(jobPosting.getBenefits())
                .teamInfo(jobPosting.getTeamInfo())

                .status(jobPosting.getStatus())
                .isDeleted(jobPosting.getIsDeleted())

                .applicationDeadline(jobPosting.getApplicationDeadline())

                .createdAt(jobPosting.getCreatedAt())
                .updatedAt(jobPosting.getUpdatedAt())
                .closedAt(jobPosting.getClosedAt())
                .build();
    }
}