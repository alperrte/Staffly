package com.department_service.repository;

import com.department_service.entity.EmployeePosition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeePositionRepository extends JpaRepository<EmployeePosition, Long> {

    List<EmployeePosition> findByPositionId(Long positionId);

    List<EmployeePosition> findByEmployeeId(Long employeeId);
}