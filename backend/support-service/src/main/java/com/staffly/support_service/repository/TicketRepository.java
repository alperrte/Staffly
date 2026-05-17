package com.staffly.support_service.repository;

import com.staffly.support_service.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByEmployeeIdAndIsDeletedFalseOrderByCreatedAtDesc(
            Long employeeId
    );

    List<Ticket> findByIsDeletedFalseOrderByCreatedAtDesc();

    List<Ticket> findByDepartmentIdAndIsDeletedFalseOrderByCreatedAtDesc(Long departmentId);
}
