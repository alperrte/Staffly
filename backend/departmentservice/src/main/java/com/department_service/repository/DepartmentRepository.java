package com.department_service.repository;

import com.department_service.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByDeletedFalse();
}