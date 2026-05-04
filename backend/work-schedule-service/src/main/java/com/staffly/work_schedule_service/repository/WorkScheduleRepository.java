package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

    Optional<WorkSchedule> findByEmployeeIdAndWorkDate(
            Long employeeId,
            LocalDate workDate
    );

    boolean existsByEmployeeIdAndWorkDate(
            Long employeeId,
            LocalDate workDate
    );

    List<WorkSchedule> findByEmployeeIdAndWorkDateBetween(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<WorkSchedule> findByDepartmentIdAndWorkDateBetween(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<WorkSchedule> findByWorkDate(LocalDate workDate);

    List<WorkSchedule> findByWorkDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}