package com.taskservice.task.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_comments", schema = "task")
@Data
public class TaskComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;
    private Long userId;

    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();
}