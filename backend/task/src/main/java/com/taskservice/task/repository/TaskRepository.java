package com.taskservice.task.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.taskservice.task.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByIsDeletedFalse(Pageable pageable);

    Page<Task> findByDepartmentIdAndIsDeletedFalse(Long departmentId, Pageable pageable);

    // 🔥 EMPLOYEE TASKS (BASIC)
    @Query("""
        SELECT t FROM Task t
        JOIN TaskAssignment ta ON t.id = ta.taskId
        WHERE ta.employeeId = :employeeId
        AND t.isDeleted = false
    """)
    Page<Task> findTasksByEmployeeId(
            Long employeeId,
            Pageable pageable
    );

    // 🔥 EMPLOYEE TASKS + STATUS FILTER
    @Query("""
        SELECT t FROM Task t
        JOIN TaskAssignment ta ON t.id = ta.taskId
        WHERE ta.employeeId = :employeeId
        AND t.isDeleted = false
        AND (:statusId IS NULL OR t.statusId = :statusId)
    """)
    Page<Task> findTasksByEmployeeIdAndStatus(
            Long employeeId,
            Integer statusId,
            Pageable pageable
    );

    // 🔥 FULL FILTER (STATUS + PRIORITY)
    @Query("""
        SELECT t FROM Task t
        JOIN TaskAssignment ta ON t.id = ta.taskId
        WHERE ta.employeeId = :employeeId
        AND t.isDeleted = false
        AND (:statusId IS NULL OR t.statusId = :statusId)
        AND (:priority IS NULL OR t.priority = :priority)
    """)
    Page<Task> findTasksByEmployeeWithFilters(
            Long employeeId,
            Integer statusId,
            String priority,
            Pageable pageable
    );

    // 🔥 DATE RANGE FILTER (dueDate)
    @Query("""
        SELECT t FROM Task t
        JOIN TaskAssignment ta ON t.id = ta.taskId
        WHERE ta.employeeId = :employeeId
        AND t.isDeleted = false
        AND (:startDate IS NULL OR t.dueDate >= :startDate)
        AND (:endDate IS NULL OR t.dueDate <= :endDate)
    """)
    Page<Task> findTasksByEmployeeAndDateRange(
            Long employeeId,
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate,
            Pageable pageable
    );

    // 🔥 FULL PRO QUERY (ALL FILTERS 🚀)
    @Query("""
        SELECT t FROM Task t
        JOIN TaskAssignment ta ON t.id = ta.taskId
        WHERE ta.employeeId = :employeeId
        AND t.isDeleted = false
        AND (:statusId IS NULL OR t.statusId = :statusId)
        AND (:priority IS NULL OR t.priority = :priority)
        AND (:startDate IS NULL OR t.dueDate >= :startDate)
        AND (:endDate IS NULL OR t.dueDate <= :endDate)
    """)
    Page<Task> findTasksFullFilter(
            Long employeeId,
            Integer statusId,
            String priority,
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT t FROM Task t
        JOIN TaskAssignment ta ON t.id = ta.taskId
        WHERE t.isDeleted = false
        AND ta.employeeId = :employeeId
        AND (:statusId IS NULL OR t.statusId = :statusId)
        AND (:priority IS NULL OR t.priority = :priority)
        AND (:startDate IS NULL OR t.dueDate >= :startDate)
        AND (:endDate IS NULL OR t.dueDate <= :endDate)
    """)
    Page<Task> findMyTasksFullFilter(
            Long employeeId,
            Integer statusId,
            String priority,
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate,
            Pageable pageable
    );
}
