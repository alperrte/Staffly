package com.staffly.work_schedule_service.dto.response;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentWorkScheduleResponse {

    private Long id;

    private Long departmentId;

    private LocalTime startTime;
    private LocalTime endTime;

    private LocalTime breakStartTime;
    private LocalTime breakEndTime;

    private Boolean active;
}