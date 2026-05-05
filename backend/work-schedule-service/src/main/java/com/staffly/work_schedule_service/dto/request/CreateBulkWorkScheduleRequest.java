package com.staffly.work_schedule_service.dto.request;

import com.staffly.work_schedule_service.entity.enums.WorkModel;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBulkWorkScheduleRequest {

    private Long departmentId;

    private LocalDate startDate;
    private LocalDate endDate;

    private WorkModel workModel;
}