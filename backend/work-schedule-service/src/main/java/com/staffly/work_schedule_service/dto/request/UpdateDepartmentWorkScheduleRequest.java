package com.staffly.work_schedule_service.dto.request;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDepartmentWorkScheduleRequest {

    private Long departmentId;

    private LocalTime startTime;
    private LocalTime endTime;

    private LocalTime breakStartTime;
    private LocalTime breakEndTime;
}