package com.staffly.work_schedule_service.dto.response;

import com.staffly.work_schedule_service.entity.enums.ParticipantStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantResponse {

    private Long employeeId;

    private ParticipantStatus status;
}