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

    private String phone;
    private LocalDate birthDate;
    private String gender;
    private String medeniDurum;
    private String tc;

    @NotNull
    private Long departmentId;

    @NotNull
    private Long positionId;
}