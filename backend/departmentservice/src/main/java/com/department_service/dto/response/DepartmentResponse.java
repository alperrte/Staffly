package com.department_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private Long managerId;
    private Boolean deleted;
    private List<SubDepartmentResponse> subDepartments;
}