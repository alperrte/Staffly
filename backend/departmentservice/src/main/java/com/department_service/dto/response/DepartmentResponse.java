package com.department_service.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentResponse {

    private Long id;
    private String name;
    private String description;
    private Long managerId;

}