package com.organizationservice.repository;

import com.organizationservice.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findByDeletedFalse();
}