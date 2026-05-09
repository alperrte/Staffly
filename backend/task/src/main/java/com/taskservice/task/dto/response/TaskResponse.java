package com.taskservice.task.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private Long projectId;
    private Integer statusId;
    private String status;
    private String priority;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Long> assigneeEmployeeIds;
    private List<String> assigneeEmails;
    private Long departmentId;
}