package com.leave_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaveBalanceResponse {

    private Long employeeId;
    private Long leaveTypeId;
    private String leaveTypeName;
    private Integer quotaDays;
    private Integer remainingDays;
    private Integer remainingHours;
}
