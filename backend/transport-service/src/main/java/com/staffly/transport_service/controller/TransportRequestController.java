package com.staffly.transport_service.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.staffly.transport_service.dto.request.CreateTransportRequest;
import com.staffly.transport_service.dto.request.ReviewTransportRequest;
import com.staffly.transport_service.dto.response.TransportRequestResponse;
import com.staffly.transport_service.service.TransportRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/transport-requests")
@RequiredArgsConstructor
public class TransportRequestController {

    private final TransportRequestService transportRequestService;

    @GetMapping
    public List<TransportRequestResponse> getAllRequests() {
        return transportRequestService.getAllRequests();
    }

    @GetMapping("/employee/{employeeId}")
    public List<TransportRequestResponse> getRequestsByEmployee(@PathVariable Long employeeId) {
        return transportRequestService.getRequestsByEmployee(employeeId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','SYSTEM_ADMIN')")
    public TransportRequestResponse createRequest(@Valid @RequestBody CreateTransportRequest request) {
        return transportRequestService.createRequest(request);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER')")
    public TransportRequestResponse approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewTransportRequest request
    ) {
        return transportRequestService.reviewRequest(id, true, request);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER')")
    public TransportRequestResponse rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewTransportRequest request
    ) {
        return transportRequestService.reviewRequest(id, false, request);
    }
}