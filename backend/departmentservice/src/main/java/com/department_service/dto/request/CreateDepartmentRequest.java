package com.department_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDepartmentRequest {

    private String name;
    private String description;
    private Long managerId;

}