package com.leave_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_approvals", schema = "leave")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 LEAVE REQUEST RELATION
    @ManyToOne
    @JoinColumn(name = "leave_request_id", nullable = false)
    private LeaveRequest leaveRequest;

    // 🔥 MANAGER
    @Column(name = "manager_id", nullable = false)
    private Long managerId;

    // 🔥 ACTION
    @Column(nullable = false)
    private String action; // APPROVED / REJECTED

    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}