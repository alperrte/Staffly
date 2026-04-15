package com.taskservice.task.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "task_assignments", schema = "task")
@Data
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long taskId;
    private Long employeeId;
}