package com.leave_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeaveResponse {

    private Long id;
    private Long employeeId;
    private String leaveTypeName;

    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    private Integer totalDays;
    private Integer totalHours;

    private String status;
    private String reason;
    private String employeeFirstName;
    private String employeeLastName;
    private String employeeFullName;

    private LocalDateTime createdAt;
}
