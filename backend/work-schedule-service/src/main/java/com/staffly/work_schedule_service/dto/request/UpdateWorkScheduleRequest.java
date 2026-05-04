package com.staffly.work_schedule_service.dto.request;

import com.staffly.work_schedule_service.entity.enums.WorkModel;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateWorkScheduleRequest {

    private Long employeeId;

    private Long departmentId;

    private LocalDate workDate;

    private WorkModel workModel;

    private String note;
}