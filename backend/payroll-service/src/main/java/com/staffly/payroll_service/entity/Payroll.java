package com.staffly.payroll_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private int month;
    private int year;

    private BigDecimal baseSalary;
    private BigDecimal totalBonus;
    private BigDecimal totalDeduction;
    private BigDecimal netSalary;

    private String status;

    private LocalDateTime createdAt;
}
