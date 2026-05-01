package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.CompanyHoliday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CompanyHolidayRepository extends JpaRepository<CompanyHoliday, Long> {

    Optional<CompanyHoliday> findByHolidayDate(LocalDate holidayDate);

    boolean existsByHolidayDate(LocalDate holidayDate);

    List<CompanyHoliday> findByActiveTrue();

    List<CompanyHoliday> findByHolidayDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}