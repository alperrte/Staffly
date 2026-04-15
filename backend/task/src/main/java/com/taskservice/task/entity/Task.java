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
    private LocalDateTime startDate;
    private LocalDateTime dueDate;

    private Long createdBy;

    private Boolean isDeleted = false;
}