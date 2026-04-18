package com.staffly.payroll_service.dto;

import lombok.Data;

@Data
public class PayrollRequest {

    private Long employeeId;
    private int month;
    private int year;
}