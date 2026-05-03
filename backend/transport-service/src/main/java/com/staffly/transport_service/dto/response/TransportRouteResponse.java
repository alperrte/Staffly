package com.staffly.transport_service.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransportRouteResponse {
    private Long id;
    private String routeCode;
    private String routeName;
    private String description;
    private String originArea;
    private String destinationArea;
    private List<String> serviceAreas;
    private Integer capacity;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}