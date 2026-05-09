package com.staffly.support_service.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TicketCommentResponse {

    private Long id;

    private Long employeeId;

    private String comment;

    private LocalDateTime createdAt;
}