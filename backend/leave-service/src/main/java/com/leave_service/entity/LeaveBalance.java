package com.leave_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_balances", schema = "leave")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 EMPLOYEE
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    // 🔥 LEAVE TYPE RELATION
    @ManyToOne
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    // 🔥 BAKİYE
    @Column(name = "remaining_days")
    private Integer remainingDays;

    @Column(name = "remaining_hours")
    private Integer remainingHours;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}