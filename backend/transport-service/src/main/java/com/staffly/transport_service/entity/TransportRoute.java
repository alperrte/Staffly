package com.staffly.transport_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transport_routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransportRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "route_code", nullable = false, unique = true, length = 60)
    private String routeCode;

    @Column(name = "route_name", nullable = false, length = 150)
    private String routeName;

    @Column(length = 1000)
    private String description;

    @Column(name = "origin_area", nullable = false, length = 150)
    private String originArea;

    @Column(name = "destination_area", nullable = false, length = 150)
    private String destinationArea;

    @Column(name = "service_areas", nullable = false, length = 1000)
    private String serviceAreas;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}