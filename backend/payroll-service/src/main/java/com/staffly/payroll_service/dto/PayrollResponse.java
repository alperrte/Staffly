package com.staffly.payroll_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PayrollResponse {

    private Long employeeId;
    private int month;
    private int year;

    private BigDecimal baseSalary;
    private BigDecimal totalBonus;
    private BigDecimal totalDeduction;
    private BigDecimal netSalary;

    private String status;
}