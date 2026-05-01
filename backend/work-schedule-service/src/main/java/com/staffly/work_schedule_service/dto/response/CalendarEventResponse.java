package com.staffly.work_schedule_service.dto.response;

import com.staffly.work_schedule_service.entity.enums.CalendarEventStatus;
import com.staffly.work_schedule_service.entity.enums.EventType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventResponse {

    private Long id;

    private String title;
    private String description;

    private EventType eventType;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    private String location;
    private String onlineMeetingUrl;

    private Long departmentId;

    private CalendarEventStatus status;

    private List<ParticipantResponse> participants;
}