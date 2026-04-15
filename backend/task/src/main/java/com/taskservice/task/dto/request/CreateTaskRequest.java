package com.taskservice.task.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {
    private String title;
    private String description;
    private String priority;
    private LocalDateTime startDate;
    private LocalDateTime dueDate;
}