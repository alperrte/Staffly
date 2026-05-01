package com.staffly.work_schedule_service.dto.request;

import com.staffly.work_schedule_service.entity.enums.WorkModel;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateWorkScheduleRequest {

    private Long employeeId;
    private Long departmentId;

    private Long shiftId;

    private LocalDate workDate;

    private WorkModel workModel;

    private String note;
}