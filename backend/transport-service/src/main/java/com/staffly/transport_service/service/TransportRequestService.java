package com.staffly.transport_service.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.staffly.transport_service.dto.request.CreateTransportRequest;
import com.staffly.transport_service.dto.request.ReviewTransportRequest;
import com.staffly.transport_service.dto.response.TransportRequestResponse;
import com.staffly.transport_service.entity.TransportRequest;
import com.staffly.transport_service.entity.TransportRoute;
import com.staffly.transport_service.entity.enums.TransportRequestStatus;
import com.staffly.transport_service.repository.TransportRequestRepository;
import com.staffly.transport_service.repository.TransportRouteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransportRequestService {

    private final TransportRequestRepository transportRequestRepository;
    private final TransportRouteRepository transportRouteRepository;
    private final TransportRouteService transportRouteService;

    public List<TransportRequestResponse> getAllRequests() {
        return transportRequestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransportRequestResponse> getRequestsByEmployee(Long employeeId) {
        return transportRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransportRequestResponse createRequest(CreateTransportRequest request) {
        TransportRoute route = transportRouteRepository.findById(request.getPreferredRouteId())
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        if (!Boolean.TRUE.equals(route.getActive())) {
            throw new IllegalArgumentException("Selected route is not active");
        }

        TransportRequest transportRequest = TransportRequest.builder()
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName().trim())
                .employeeDistrict(route.getOriginArea())
                .employeeNeighborhood(null)
                .preferredRoute(route)
                .status(TransportRequestStatus.PENDING)
                .note(trimToNull(request.getNote()))
                .build();

        return mapToResponse(transportRequestRepository.save(transportRequest));
    }

    public TransportRequestResponse reviewRequest(Long requestId, boolean approve, ReviewTransportRequest reviewRequest) {
        TransportRequest transportRequest = transportRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Transport request not found"));

        if (transportRequest.getStatus() != TransportRequestStatus.PENDING) {
            throw new IllegalArgumentException("Only pending requests can be reviewed");
        }

        if (approve) {
            TransportRoute route = transportRequest.getPreferredRoute();
            if (route != null) {
                long approvedCount = transportRequestRepository
                        .countByPreferredRoute_IdAndStatus(route.getId(), TransportRequestStatus.APPROVED);

                if (approvedCount >= route.getCapacity()) {
                    throw new IllegalArgumentException("Selected route is already full");
                }
            }

            transportRequest.setStatus(TransportRequestStatus.APPROVED);
        } else {
            transportRequest.setStatus(TransportRequestStatus.REJECTED);
        }

        if (reviewRequest != null) {
            transportRequest.setReviewNote(trimToNull(reviewRequest.getNote()));
        }

        return mapToResponse(transportRequestRepository.save(transportRequest));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private TransportRequestResponse mapToResponse(TransportRequest request) {
        TransportRoute route = request.getPreferredRoute();

        return TransportRequestResponse.builder()
                .id(request.getId())
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName())
                .employeeDistrict(request.getEmployeeDistrict())
                .employeeNeighborhood(request.getEmployeeNeighborhood())
                .preferredRouteId(route != null ? route.getId() : null)
                .preferredRouteCode(route != null ? route.getRouteCode() : null)
                .preferredRouteName(route != null ? route.getRouteName() : null)
                .status(request.getStatus())
                .note(request.getNote())
                .reviewNote(request.getReviewNote())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
