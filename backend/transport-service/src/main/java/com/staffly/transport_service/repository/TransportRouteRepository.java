package com.staffly.transport_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.staffly.transport_service.entity.TransportRoute;

public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {
    List<TransportRoute> findAllByOrderByRouteNameAsc();

    List<TransportRoute> findAllByActiveTrueOrderByRouteNameAsc();

    Optional<TransportRoute> findByRouteCodeIgnoreCase(String routeCode);

    boolean existsByRouteCodeIgnoreCase(String routeCode);
}