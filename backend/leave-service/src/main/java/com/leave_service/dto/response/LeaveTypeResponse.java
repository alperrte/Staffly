package com.leave_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaveTypeResponse {

    private Long id;
    private String name;
    private String description;
    private Boolean isHourly;
}