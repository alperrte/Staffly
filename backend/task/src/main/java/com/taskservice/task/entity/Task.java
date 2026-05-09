package com.taskservice.task.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks", schema = "task")
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    private Integer statusId;

    private String priority;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    // 🔥 CREATE anında çalışır
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // 🔥 UPDATE anında çalışır
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}