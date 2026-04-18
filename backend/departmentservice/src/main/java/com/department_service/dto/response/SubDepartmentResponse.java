package com.department_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubDepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private Long managerId;
    private Long departmentId;

    private List<DepartmentPositionResponse> positions;
}