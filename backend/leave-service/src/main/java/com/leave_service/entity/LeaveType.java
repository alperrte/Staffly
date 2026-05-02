package com.leave_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_types", schema = "leave")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "is_hourly", nullable = false)
    private Boolean isHourly;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}