package com.leave_service.dto.request;

import lombok.Data;

@Data
public class LeaveTypeCreateRequest {

    private String name;
    private String description;
    private Boolean isHourly;
}