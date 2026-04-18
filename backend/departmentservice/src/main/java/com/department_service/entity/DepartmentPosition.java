package com.department_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "department_positions")
@Getter
@Setter
public class DepartmentPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sub_department_id", nullable = false)
    private Long subDepartmentId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted")
    private Boolean deleted;
}