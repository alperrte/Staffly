package com.leave_service.dto.request;

import lombok.Data;

@Data
public class LeaveApprovalRequest {

    private Long leaveRequestId;
    private Long managerId;
    private String action; // APPROVED / REJECTED
    private String comment;
}