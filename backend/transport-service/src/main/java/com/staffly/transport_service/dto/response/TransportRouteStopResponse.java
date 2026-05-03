package com.staffly.transport_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportRouteStopResponse {

    private Long routeId;
    private String routeCode;
    private String routeName;
    private Integer stopOrder;
    private String stopName;
    private Double latitude;
    private Double longitude;
}
