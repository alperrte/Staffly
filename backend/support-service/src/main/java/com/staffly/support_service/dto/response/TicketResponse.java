package com.staffly.support_service.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TicketResponse {

    private Long id;

    private String title;

    private String description;

    private String priority;

    private String status;

    private String category;

    private Long employeeId;

    private Long assignedTo;

    private LocalDateTime createdAt;
}