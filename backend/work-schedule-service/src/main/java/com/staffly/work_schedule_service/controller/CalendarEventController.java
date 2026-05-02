package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.AddParticipantsRequest;
import com.staffly.work_schedule_service.dto.request.CreateCalendarEventRequest;
import com.staffly.work_schedule_service.dto.request.UpdateCalendarEventRequest;
import com.staffly.work_schedule_service.dto.response.CalendarEventResponse;
import com.staffly.work_schedule_service.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar-events")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    @PostMapping
    public CalendarEventResponse createCalendarEvent(
            @RequestBody CreateCalendarEventRequest request
    ) {
        return calendarEventService.createCalendarEvent(request);
    }

    @PutMapping("/{id}")
    public CalendarEventResponse updateCalendarEvent(
            @PathVariable Long id,
            @RequestBody UpdateCalendarEventRequest request
    ) {
        return calendarEventService.updateCalendarEvent(id, request);
    }

    @PatchMapping("/{id}/cancel")
    public CalendarEventResponse cancelCalendarEvent(@PathVariable Long id) {
        return calendarEventService.cancelCalendarEvent(id);
    }

    @PostMapping("/{id}/participants")
    public CalendarEventResponse addParticipants(
            @PathVariable Long id,
            @RequestBody AddParticipantsRequest request
    ) {
        return calendarEventService.addParticipants(id, request);
    }

    @DeleteMapping("/{id}/participants/{employeeId}")
    public void removeParticipant(
            @PathVariable Long id,
            @PathVariable Long employeeId
    ) {
        calendarEventService.removeParticipant(id, employeeId);
    }

    @GetMapping("/department/{departmentId}")
    public List<CalendarEventResponse> getDepartmentEvents(
            @PathVariable Long departmentId,
            @RequestParam LocalDateTime startDateTime,
            @RequestParam LocalDateTime endDateTime
    ) {
        return calendarEventService.getDepartmentEvents(
                departmentId,
                startDateTime,
                endDateTime
        );
    }

    @GetMapping
    public List<CalendarEventResponse> getAllEvents(
            @RequestParam LocalDateTime startDateTime,
            @RequestParam LocalDateTime endDateTime
    ) {
        return calendarEventService.getAllEventsBetween(
                startDateTime,
                endDateTime
        );
    }
}