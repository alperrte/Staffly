package com.staffly.cv_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "sub_department_id", nullable = false)
    private Long subDepartmentId;

    @Column(name = "position_id", nullable = false)
    private Long positionId;

    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "sub_department_name", nullable = false, length = 100)
    private String subDepartmentName;

    @Column(name = "position_name", nullable = false, length = 100)
    private String positionName;

    @Column(name = "experience_level", length = 100)
    private String experienceLevel;

    @Column(name = "employment_type", length = 50)
    private String employmentType;

    @Column(name = "work_model", length = 50)
    private String workModel;

    @Column(length = 150)
    private String location;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String requirements;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String responsibilities;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String benefits;

    @Column(name = "team_info", columnDefinition = "NVARCHAR(MAX)")
    private String teamInfo;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = "ACTIVE";
        }

        if (isDeleted == null) {
            isDeleted = false;
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}