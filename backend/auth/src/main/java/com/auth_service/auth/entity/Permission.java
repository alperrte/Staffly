package com.auth_service.auth.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private long id;

    @Column(nullable=false, unique=true)
    private String name;

    private String description;

    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles;
}
