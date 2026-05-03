package com.staffly.transport_service.dto.response;

import java.time.LocalDateTime;

import com.staffly.transport_service.entity.enums.TransportRequestStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransportRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeDistrict;
    private String employeeNeighborhood;
    private Long preferredRouteId;
    private String preferredRouteCode;
    private String preferredRouteName;
    private TransportRequestStatus status;
    private String note;
    private String reviewNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}