package com.staffly.work_schedule_service.dto.request;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOvertimeRequest {

    private Long employeeId;
    private Long departmentId;

    private LocalDate overtimeDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private String reason;
}