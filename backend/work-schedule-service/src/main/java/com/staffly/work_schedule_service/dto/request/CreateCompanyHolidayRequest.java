package com.staffly.work_schedule_service.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCompanyHolidayRequest {

    private String name;

    private LocalDate holidayDate;

    private String description;
}