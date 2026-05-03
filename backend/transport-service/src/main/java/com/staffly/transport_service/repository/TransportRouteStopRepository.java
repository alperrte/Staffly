package com.staffly.transport_service.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.staffly.transport_service.entity.TransportRouteStop;

public interface TransportRouteStopRepository extends JpaRepository<TransportRouteStop, Long> {

    List<TransportRouteStop> findAllByRoute_IdOrderByStopOrderAsc(Long routeId);
}
