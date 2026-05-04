package com.staffly.work_schedule_service.dto.response;

import com.staffly.work_schedule_service.entity.enums.OvertimeStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvertimeResponse {

    private Long id;

    private Long employeeId;
    private Long departmentId;

    private LocalDate overtimeDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private String reason;

    private OvertimeStatus status;
}