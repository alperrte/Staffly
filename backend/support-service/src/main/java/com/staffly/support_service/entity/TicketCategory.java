package com.staffly.support_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ticket_categories", schema = "support")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;
}