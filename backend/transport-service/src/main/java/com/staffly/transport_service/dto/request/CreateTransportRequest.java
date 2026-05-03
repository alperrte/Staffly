package com.staffly.transport_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTransportRequest {

    @NotNull
    private Long employeeId;

    @NotBlank
    private String employeeName;

    @NotBlank
    private String employeeDistrict;

    private String employeeNeighborhood;

    @NotNull
    private Long preferredRouteId;

    private String note;
}