package com.department_service.repository;

import com.department_service.entity.DepartmentEmployee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DepartmentEmployeeRepository extends JpaRepository<DepartmentEmployee, Long> {

    List<DepartmentEmployee> findByDepartmentId(Long departmentId);
}