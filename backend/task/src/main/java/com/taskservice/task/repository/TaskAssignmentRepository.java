package com.taskservice.task.repository;

import com.taskservice.task.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

    List<TaskAssignment> findByEmployeeId(Long employeeId);

    boolean existsByTaskIdAndEmployeeId(Long taskId, Long employeeId);
}