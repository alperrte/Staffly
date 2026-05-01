package com.staffly.work_schedule_service.dto.request;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShiftRequest {

    private String name;

    private LocalTime startTime;
    private LocalTime endTime;

    private Integer breakMinutes;
}