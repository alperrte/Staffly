package com.employee_service.employee.repository;

import com.employee_service.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByIsDeletedFalse();

    Optional<Employee> findByEmail(String email);
}