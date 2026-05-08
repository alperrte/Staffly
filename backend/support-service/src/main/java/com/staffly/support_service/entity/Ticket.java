package com.staffly.support_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets", schema = "support")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    private Long employeeId;

    private Long assignedTo;

    private String priority;

    private Boolean isDeleted;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private TicketStatus status;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private TicketCategory category;
}