package com.leave_service.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LeaveRequestCreateRequest {

    private Long employeeId;
    private Long leaveTypeId;

    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    private String reason;
}