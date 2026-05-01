package com.staffly.work_schedule_service.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddParticipantsRequest {

    private List<Long> employeeIds;
}