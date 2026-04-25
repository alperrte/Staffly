package com.auth_service.auth.dto.response;

import lombok.Data;

@Data
public class EmployeeResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String status;
    private Long departmentId;
    private String positionName;
}