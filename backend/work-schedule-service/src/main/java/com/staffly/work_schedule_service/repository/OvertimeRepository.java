package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.Overtime;
import com.staffly.work_schedule_service.entity.enums.OvertimeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface OvertimeRepository extends JpaRepository<Overtime, Long> {

    List<Overtime> findByEmployeeIdAndOvertimeDateBetween(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Overtime> findByDepartmentIdAndOvertimeDateBetween(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Overtime> findByOvertimeDate(LocalDate overtimeDate);

    List<Overtime> findByStatus(OvertimeStatus status);
}