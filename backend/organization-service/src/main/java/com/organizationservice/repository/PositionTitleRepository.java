package com.organizationservice.repository;

import com.organizationservice.entity.PositionTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionTitleRepository extends JpaRepository<PositionTitle, Long> {
}