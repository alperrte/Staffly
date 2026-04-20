package com.organizationservice.repository;

import com.organizationservice.entity.OrganizationPosition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationPositionRepository extends JpaRepository<OrganizationPosition, Long> {
}