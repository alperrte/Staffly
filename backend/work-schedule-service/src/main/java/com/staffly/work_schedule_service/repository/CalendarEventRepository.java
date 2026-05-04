package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.CalendarEvent;
import com.staffly.work_schedule_service.entity.enums.CalendarEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    List<CalendarEvent> findByDepartmentIdAndStartDateTimeBetween(
            Long departmentId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );

    List<CalendarEvent> findByStartDateTimeBetween(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime
    );

    List<CalendarEvent> findByStatus(CalendarEventStatus status);

    List<CalendarEvent> findByDepartmentIdAndStatus(
            Long departmentId,
            CalendarEventStatus status
    );
}