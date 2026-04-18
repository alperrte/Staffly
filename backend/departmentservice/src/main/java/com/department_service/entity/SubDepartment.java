package com.department_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sub_departments")
@Getter
@Setter
public class SubDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted")
    private Boolean deleted;
}