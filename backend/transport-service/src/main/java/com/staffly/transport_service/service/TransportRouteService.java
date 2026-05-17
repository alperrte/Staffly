package com.staffly.transport_service.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.staffly.transport_service.dto.request.CreateTransportRouteRequest;
import com.staffly.transport_service.dto.request.UpdateTransportRouteRequest;
import com.staffly.transport_service.dto.response.TransportRouteResponse;
import com.staffly.transport_service.dto.response.TransportRouteStopResponse;
import com.staffly.transport_service.entity.TransportRoute;
import com.staffly.transport_service.entity.TransportRouteStop;
import com.staffly.transport_service.repository.TransportRouteRepository;
import com.staffly.transport_service.repository.TransportRouteStopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransportRouteService {

    private final TransportRouteRepository transportRouteRepository;
    private final TransportRouteStopRepository transportRouteStopRepository;

    public List<TransportRouteResponse> getAllRoutes() {
        return transportRouteRepository.findAllByOrderByRouteNameAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransportRouteResponse> getActiveRoutes() {
        return transportRouteRepository.findAllByActiveTrueOrderByRouteNameAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransportRouteResponse createRoute(CreateTransportRouteRequest request) {
        if (transportRouteRepository.existsByRouteCodeIgnoreCase(request.getRouteCode())) {
            throw new IllegalArgumentException("Route code already exists");
        }

        TransportRoute route = TransportRoute.builder()
                .routeCode(request.getRouteCode().trim())
                .routeName(request.getRouteName().trim())
                .description(request.getDescription())
                .originArea(request.getOriginArea().trim())
                .destinationArea(request.getDestinationArea().trim())
                .serviceAreas(joinAreas(request.getServiceAreas()))
                .capacity(request.getCapacity())
                .active(request.getActive() == null || request.getActive())
                .build();

        TransportRoute savedRoute = transportRouteRepository.save(route);

        transportRouteStopRepository.save(TransportRouteStop.builder()
                .route(savedRoute)
                .stopOrder(1)
                .stopName(savedRoute.getOriginArea())
                .latitude(BigDecimal.valueOf(request.getOriginLatitude()))
                .longitude(BigDecimal.valueOf(request.getOriginLongitude()))
                .createdAt(LocalDateTime.now())
                .build());

        transportRouteStopRepository.save(TransportRouteStop.builder()
                .route(savedRoute)
                .stopOrder(2)
                .stopName(savedRoute.getDestinationArea())
                .latitude(BigDecimal.valueOf(request.getDestinationLatitude()))
                .longitude(BigDecimal.valueOf(request.getDestinationLongitude()))
                .createdAt(LocalDateTime.now())
                .build());

        return mapToResponse(savedRoute);
    }

    public TransportRouteResponse updateRoute(Long id, UpdateTransportRouteRequest request) {
        TransportRoute route = transportRouteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        if (request.getRouteName() != null && !request.getRouteName().isBlank()) {
            route.setRouteName(request.getRouteName().trim());
        }
        if (request.getDescription() != null) {
            route.setDescription(request.getDescription());
        }
        if (request.getOriginArea() != null && !request.getOriginArea().isBlank()) {
            route.setOriginArea(request.getOriginArea().trim());
        }
        if (request.getDestinationArea() != null && !request.getDestinationArea().isBlank()) {
            route.setDestinationArea(request.getDestinationArea().trim());
        }
        if (request.getServiceAreas() != null && !request.getServiceAreas().isEmpty()) {
            route.setServiceAreas(joinAreas(request.getServiceAreas()));
        }
        if (request.getCapacity() != null) {
            route.setCapacity(request.getCapacity());
        }
        if (request.getActive() != null) {
            route.setActive(request.getActive());
        }

        return mapToResponse(transportRouteRepository.save(route));
    }

    public TransportRouteResponse setActive(Long id, boolean active) {
        TransportRoute route = transportRouteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        route.setActive(active);
        return mapToResponse(transportRouteRepository.save(route));
    }

    public TransportRouteResponse getRouteResponse(Long id) {
        return mapToResponse(transportRouteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Route not found")));
    }

        public List<TransportRouteStopResponse> getRouteStops(Long routeId) {
        TransportRoute route = transportRouteRepository.findById(routeId)
            .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        return transportRouteStopRepository.findAllByRoute_IdOrderByStopOrderAsc(routeId)
            .stream()
            .map(stop -> mapToStopResponse(route, stop))
            .toList();
        }

    public boolean routeSupportsArea(TransportRoute route, String district, String neighborhood) {
        return serviceAreas(route).stream().anyMatch(area -> {
            String normalized = area.toLowerCase();
            return matches(normalized, district) || matches(normalized, neighborhood);
        });
    }

    public List<String> serviceAreas(TransportRoute route) {
        if (route.getServiceAreas() == null || route.getServiceAreas().isBlank()) {
            return List.of();
        }

        return List.of(route.getServiceAreas().split("\\s*,\\s*"))
                .stream()
                .filter(area -> !area.isBlank())
                .toList();
    }

    private boolean matches(String area, String value) {
        return value != null && !value.isBlank() && area.contains(value.trim().toLowerCase());
    }

    private String joinAreas(List<String> serviceAreas) {
        return serviceAreas.stream()
                .map(String::trim)
                .filter(area -> !area.isBlank())
                .collect(Collectors.joining(", "));
    }

    private TransportRouteResponse mapToResponse(TransportRoute route) {
        return TransportRouteResponse.builder()
                .id(route.getId())
                .routeCode(route.getRouteCode())
                .routeName(route.getRouteName())
                .description(route.getDescription())
                .originArea(route.getOriginArea())
                .destinationArea(route.getDestinationArea())
                .serviceAreas(serviceAreas(route))
                .capacity(route.getCapacity())
                .active(route.getActive())
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }

    private TransportRouteStopResponse mapToStopResponse(TransportRoute route, TransportRouteStop stop) {
        return TransportRouteStopResponse.builder()
                .routeId(route.getId())
                .routeCode(route.getRouteCode())
                .routeName(route.getRouteName())
                .stopOrder(stop.getStopOrder())
                .stopName(stop.getStopName())
                .latitude(stop.getLatitude().doubleValue())
                .longitude(stop.getLongitude().doubleValue())
                .build();
    }
}
