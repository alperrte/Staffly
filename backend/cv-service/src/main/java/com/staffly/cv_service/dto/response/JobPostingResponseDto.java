package com.staffly.cv_service.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingResponseDto {

    private Long id;

    private String title;
    private String description;

    private Long departmentId;
    private Long subDepartmentId;
    private Long positionId;

    private String departmentName;
    private String subDepartmentName;
    private String positionName;

    private String experienceLevel;
    private String employmentType;
    private String workModel;
    private String location;

    private String requirements;
    private String responsibilities;
    private String benefits;
    private String teamInfo;

    private String status;
    private Boolean isDeleted;

    private LocalDate applicationDeadline;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime closedAt;
}