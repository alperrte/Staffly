package com.employee_service.employee.repository;

import com.employee_service.employee.entity.EmployeeJobInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeJobInfoRepository extends JpaRepository<EmployeeJobInfo, Long> {
    Optional<EmployeeJobInfo> findByEmployeeId(Long employeeId);
}