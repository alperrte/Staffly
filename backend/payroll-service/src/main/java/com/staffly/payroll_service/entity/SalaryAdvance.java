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
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "salary_advances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryAdvance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private BigDecimal amount;

    private LocalDate requestDate;

    private Boolean approved;

    private String rejectionReason;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;
}