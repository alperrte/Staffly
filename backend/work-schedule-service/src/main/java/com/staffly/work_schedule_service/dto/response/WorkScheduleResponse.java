package com.staffly.work_schedule_service.dto.response;

import com.staffly.work_schedule_service.entity.enums.WorkModel;
import com.staffly.work_schedule_service.entity.enums.WorkScheduleStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkScheduleResponse {

    private Long id;

    private Long employeeId;
    private Long departmentId;

    private ShiftResponse shift;

    private LocalDate workDate;

    private WorkModel workModel;

    private WorkScheduleStatus status;

    private String note;
}