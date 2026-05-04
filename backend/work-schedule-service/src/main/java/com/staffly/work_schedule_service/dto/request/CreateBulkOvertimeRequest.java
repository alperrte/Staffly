package com.staffly.work_schedule_service.dto.request;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBulkOvertimeRequest {

    private Long departmentId;

    private List<Long> employeeIds;

    private LocalDate overtimeDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private String reason;
}