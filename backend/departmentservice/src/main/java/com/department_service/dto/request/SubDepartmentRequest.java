package com.department_service.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubDepartmentRequest {

    private String name;
    private String description;
    private Long managerId;

    private List<DepartmentPositionRequest> positions;
}