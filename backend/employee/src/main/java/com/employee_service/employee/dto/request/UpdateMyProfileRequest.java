package com.employee_service.employee.dto.request;

import lombok.Data;

@Data
public class UpdateMyProfileRequest {

    private String phone;

    private String email;
}