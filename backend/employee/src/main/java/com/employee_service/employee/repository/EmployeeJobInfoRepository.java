package com.employee_service.employee.repository;

import com.employee_service.employee.entity.EmployeeJobInfo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeJobInfoRepository extends JpaRepository<EmployeeJobInfo, Long> {
}