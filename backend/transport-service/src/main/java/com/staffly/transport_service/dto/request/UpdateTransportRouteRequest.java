package com.staffly.transport_service.dto.request;

import java.util.List;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateTransportRouteRequest {

    private String routeName;
    private String description;
    private String originArea;
    private String destinationArea;
    private List<String> serviceAreas;

    @Min(1)
    private Integer capacity;

    private Boolean active;
}