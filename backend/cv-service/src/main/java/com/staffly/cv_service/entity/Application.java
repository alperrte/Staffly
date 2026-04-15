package com.staffly.cv_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", nullable = false, length = 30)
    private String phone;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "position", nullable = false, length = 100)
    private String position;

    @Column(name = "cv_original_file_name", nullable = false, length = 255)
    private String cvOriginalFileName;

    @Column(name = "cv_stored_file_name", nullable = false, length = 255)
    private String cvStoredFileName;

    @Column(name = "cv_file_path", nullable = false, length = 500)
    private String cvFilePath;

    @Column(name = "cv_content_type", nullable = false, length = 100)
    private String cvContentType;

    @Column(name = "cv_file_size", nullable = false)
    private Long cvFileSize;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "is_reviewed", nullable = false)
    private Boolean isReviewed;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.isReviewed == null) {
            this.isReviewed = false;
        }
        if (this.appliedAt == null) {
            this.appliedAt = LocalDateTime.now();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
