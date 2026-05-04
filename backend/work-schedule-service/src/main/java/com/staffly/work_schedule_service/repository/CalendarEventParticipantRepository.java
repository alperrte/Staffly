package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.CalendarEventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CalendarEventParticipantRepository extends JpaRepository<CalendarEventParticipant, Long> {

    List<CalendarEventParticipant> findByEmployeeId(Long employeeId);

    List<CalendarEventParticipant> findByCalendarEventId(Long eventId);

    Optional<CalendarEventParticipant> findByCalendarEventIdAndEmployeeId(
            Long eventId,
            Long employeeId
    );

    boolean existsByCalendarEventIdAndEmployeeId(
            Long eventId,
            Long employeeId
    );

    void deleteByCalendarEventIdAndEmployeeId(
            Long eventId,
            Long employeeId
    );
}