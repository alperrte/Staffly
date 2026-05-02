package com.leave_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests", schema = "leave")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 EMPLOYEE
    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    // 🔥 LEAVE TYPE
    @ManyToOne
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    // 🔥 DATETIME
    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    // 🔥 hesaplanan
    @Column(name = "total_days")
    private Integer totalDays;

    @Column(name = "total_hours")
    private Integer totalHours;

    // 🔥 durum
    @Column(nullable = false)
    private String status;

    private String reason;

    // 🔥 created_at (TEK olacak!)
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 🔥 OTOMATİK TARİH
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}