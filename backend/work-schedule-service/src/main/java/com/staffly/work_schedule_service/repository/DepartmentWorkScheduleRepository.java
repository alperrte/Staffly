package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.DepartmentWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentWorkScheduleRepository extends JpaRepository<DepartmentWorkSchedule, Long> {

    Optional<DepartmentWorkSchedule> findByDepartmentIdAndActiveTrue(Long departmentId);

    boolean existsByDepartmentIdAndActiveTrue(Long departmentId);

    List<DepartmentWorkSchedule> findByActiveTrue();

    List<DepartmentWorkSchedule> findByDepartmentId(Long departmentId);
}