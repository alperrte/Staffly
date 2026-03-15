package com.employee_service.employee.repository;


import com.employee_service.employee.entity.EmployeePersonalInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeePersonalInfoRepository extends JpaRepository<EmployeePersonalInfo, Long> {
    Optional<EmployeePersonalInfo> findByEmployeeId(Long employeeId);

}