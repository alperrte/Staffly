package com.staffly.cv_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponseDto {

    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Long jobPostingId;
    /** İlan başlığı (liste/detay için; silinmiş ilanda null olabilir) */
    private String jobPostingTitle;
    private Long departmentId;
    private Long subDepartmentId;
    private Long positionId;

    private String departmentName;
    private String subDepartmentName;
    private String positionName;

    private String cvOriginalFileName;
    private String cvStoredFileName;
    private String cvFilePath;
    private String cvContentType;
    private Long cvFileSize;

    private String status;
    private Boolean isReviewed;

    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}