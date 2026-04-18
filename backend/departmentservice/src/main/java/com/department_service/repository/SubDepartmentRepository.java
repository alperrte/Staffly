package com.department_service.repository;

import com.department_service.entity.SubDepartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubDepartmentRepository extends JpaRepository<SubDepartment, Long> {

    List<SubDepartment> findByDepartmentIdAndDeletedFalse(Long departmentId);

    List<SubDepartment> findByDeletedFalse();
}