package com.staffly.support_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_status", schema = "support")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketStatus {

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}