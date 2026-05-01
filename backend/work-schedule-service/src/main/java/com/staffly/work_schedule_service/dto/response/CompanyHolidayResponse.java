package com.staffly.work_schedule_service.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyHolidayResponse {

    private Long id;

    private String name;

    private LocalDate holidayDate;

    private String description;

    private Boolean active;
}