package com.staffly.support_service.repository;

import com.staffly.support_service.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketStatusRepository extends JpaRepository<TicketStatus, Long> {
}