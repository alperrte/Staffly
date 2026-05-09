package com.staffly.transport_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.staffly.transport_service.dto.request.CreateTransportRouteRequest;
import com.staffly.transport_service.dto.request.UpdateTransportRouteRequest;
import com.staffly.transport_service.dto.response.TransportRouteResponse;
import com.staffly.transport_service.dto.response.TransportRouteStopResponse;
import com.staffly.transport_service.service.TransportRouteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/transport-routes")
@RequiredArgsConstructor
public class TransportRouteController {

    private final TransportRouteService transportRouteService;

    @GetMapping
    public List<TransportRouteResponse> getAllRoutes() {
        return transportRouteService.getAllRoutes();
    }

    @GetMapping("/active")
    public List<TransportRouteResponse> getActiveRoutes() {
        return transportRouteService.getActiveRoutes();
    }

    @GetMapping("/{id}/stops")
    public List<TransportRouteStopResponse> getRouteStops(@PathVariable Long id) {
        return transportRouteService.getRouteStops(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER')")
    public TransportRouteResponse createRoute(@Valid @RequestBody CreateTransportRouteRequest request) {
        return transportRouteService.createRoute(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER')")
    public TransportRouteResponse updateRoute(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTransportRouteRequest request
    ) {
        return transportRouteService.updateRoute(id, request);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER')")
    public TransportRouteResponse activateRoute(@PathVariable Long id) {
        return transportRouteService.setActive(id, true);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER')")
    public TransportRouteResponse deactivateRoute(@PathVariable Long id) {
        return transportRouteService.setActive(id, false);
    }
}