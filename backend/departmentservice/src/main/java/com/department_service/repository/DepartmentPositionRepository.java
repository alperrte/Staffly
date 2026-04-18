package com.department_service.repository;

import com.department_service.entity.DepartmentPosition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentPositionRepository extends JpaRepository<DepartmentPosition, Long> {

    List<DepartmentPosition> findBySubDepartmentIdAndDeletedFalse(Long subDepartmentId);

    List<DepartmentPosition> findByDeletedFalse();
}