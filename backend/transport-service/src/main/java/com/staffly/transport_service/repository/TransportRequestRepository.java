package com.staffly.transport_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.staffly.transport_service.entity.TransportRequest;
import com.staffly.transport_service.entity.enums.TransportRequestStatus;

public interface TransportRequestRepository extends JpaRepository<TransportRequest, Long> {
    List<TransportRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    long countByPreferredRoute_IdAndStatus(Long routeId, TransportRequestStatus status);
}