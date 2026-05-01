package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.client.WorkDepartmentClient;
import com.staffly.work_schedule_service.client.WorkEmployeeClient;
import com.staffly.work_schedule_service.dto.request.AddParticipantsRequest;
import com.staffly.work_schedule_service.dto.request.CreateCalendarEventRequest;
import com.staffly.work_schedule_service.dto.request.UpdateCalendarEventRequest;
import com.staffly.work_schedule_service.dto.response.CalendarEventResponse;
import com.staffly.work_schedule_service.dto.response.ParticipantResponse;
import com.staffly.work_schedule_service.entity.CalendarEvent;
import com.staffly.work_schedule_service.entity.CalendarEventParticipant;
import com.staffly.work_schedule_service.entity.enums.CalendarEventStatus;
import com.staffly.work_schedule_service.entity.enums.ParticipantStatus;
import com.staffly.work_schedule_service.repository.CalendarEventParticipantRepository;
import com.staffly.work_schedule_service.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final CalendarEventParticipantRepository participantRepository;

    private final WorkEmployeeClient workEmployeeClient;
    private final WorkDepartmentClient workDepartmentClient;

    public CalendarEventResponse createCalendarEvent(CreateCalendarEventRequest request) {

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new RuntimeException("Toplantı bitiş saati başlangıç saatinden sonra olmalıdır.");
        }

        CalendarEvent event = CalendarEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventType(request.getEventType())
                .startDateTime(request.getStartDateTime())
                .endDateTime(request.getEndDateTime())
                .location(request.getLocation())
                .onlineMeetingUrl(request.getOnlineMeetingUrl())
                .departmentId(request.getDepartmentId())
                .status(CalendarEventStatus.ACTIVE)
                .build();

        CalendarEvent savedEvent = calendarEventRepository.save(event);

        if (request.getParticipantIds() != null) {
            for (Long employeeId : request.getParticipantIds()) {
                addSingleParticipant(savedEvent, employeeId);
            }
        }

        CalendarEvent refreshedEvent = calendarEventRepository.findById(savedEvent.getId())
                .orElseThrow(() -> new RuntimeException("Takvim etkinliği bulunamadı."));

        return toResponse(refreshedEvent);
    }

    public CalendarEventResponse updateCalendarEvent(Long id, UpdateCalendarEventRequest request) {

        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Takvim etkinliği bulunamadı."));

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        if (!request.getEndDateTime().isAfter(request.getStartDateTime())) {
            throw new RuntimeException("Toplantı bitiş saati başlangıç saatinden sonra olmalıdır.");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setStartDateTime(request.getStartDateTime());
        event.setEndDateTime(request.getEndDateTime());
        event.setLocation(request.getLocation());
        event.setOnlineMeetingUrl(request.getOnlineMeetingUrl());
        event.setDepartmentId(request.getDepartmentId());

        CalendarEvent updatedEvent = calendarEventRepository.save(event);

        return toResponse(updatedEvent);
    }

    public CalendarEventResponse cancelCalendarEvent(Long id) {
        CalendarEvent event = calendarEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Takvim etkinliği bulunamadı."));

        event.setStatus(CalendarEventStatus.CANCELLED);

        CalendarEvent updatedEvent = calendarEventRepository.save(event);

        return toResponse(updatedEvent);
    }

    public CalendarEventResponse addParticipants(Long eventId, AddParticipantsRequest request) {

        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Takvim etkinliği bulunamadı."));

        for (Long employeeId : request.getEmployeeIds()) {
            addSingleParticipant(event, employeeId);
        }

        CalendarEvent updatedEvent = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Takvim etkinliği bulunamadı."));

        return toResponse(updatedEvent);
    }

    public void removeParticipant(Long eventId, Long employeeId) {

        if (!participantRepository.existsByCalendarEventIdAndEmployeeId(eventId, employeeId)) {
            throw new RuntimeException("Bu çalışan zaten toplantı katılımcısı değil.");
        }

        participantRepository.deleteByCalendarEventIdAndEmployeeId(eventId, employeeId);
    }

    public List<CalendarEventResponse> getDepartmentEvents(
            Long departmentId,
            java.time.LocalDateTime startDateTime,
            java.time.LocalDateTime endDateTime
    ) {
        workDepartmentClient.getDepartmentById(departmentId);

        return calendarEventRepository
                .findByDepartmentIdAndStartDateTimeBetween(
                        departmentId,
                        startDateTime,
                        endDateTime
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CalendarEventResponse> getAllEventsBetween(
            java.time.LocalDateTime startDateTime,
            java.time.LocalDateTime endDateTime
    ) {
        return calendarEventRepository
                .findByStartDateTimeBetween(startDateTime, endDateTime)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void addSingleParticipant(CalendarEvent event, Long employeeId) {

        workEmployeeClient.getEmployeeById(employeeId);

        boolean exists = participantRepository.existsByCalendarEventIdAndEmployeeId(
                event.getId(),
                employeeId
        );

        if (exists) {
            return;
        }

        CalendarEventParticipant participant = CalendarEventParticipant.builder()
                .calendarEvent(event)
                .employeeId(employeeId)
                .participantStatus(ParticipantStatus.INVITED)
                .build();

        participantRepository.save(participant);
    }

    private CalendarEventResponse toResponse(CalendarEvent event) {
        return CalendarEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventType(event.getEventType())
                .startDateTime(event.getStartDateTime())
                .endDateTime(event.getEndDateTime())
                .location(event.getLocation())
                .onlineMeetingUrl(event.getOnlineMeetingUrl())
                .departmentId(event.getDepartmentId())
                .status(event.getStatus())
                .participants(
                        event.getParticipants()
                                .stream()
                                .map(this::toParticipantResponse)
                                .toList()
                )
                .build();
    }

    private ParticipantResponse toParticipantResponse(CalendarEventParticipant participant) {
        return ParticipantResponse.builder()
                .employeeId(participant.getEmployeeId())
                .status(participant.getParticipantStatus())
                .build();
    }
}