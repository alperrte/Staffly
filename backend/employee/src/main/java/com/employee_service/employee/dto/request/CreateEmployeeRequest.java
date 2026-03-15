package com.employee_service.employee.dto.request;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @NotBlank
    private String email;

    @NotNull
    private LocalDate hireDate;

    @NotBlank
    private String status;

    private String phone;
    private LocalDate birthDate;
    private String gender;

    private Long departmentId;
    private String positionName;
}