package com.staffly.transport_service.dto.request;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTransportRouteRequest {

    @NotBlank
    private String routeCode;

    @NotBlank
    private String routeName;

    private String description;

    @NotBlank
    private String originArea;

    @NotBlank
    private String destinationArea;

    @NotEmpty
    private List<@NotBlank String> serviceAreas;

    @NotNull
    @Min(1)
    private Integer capacity;

    private Boolean active = true;
}