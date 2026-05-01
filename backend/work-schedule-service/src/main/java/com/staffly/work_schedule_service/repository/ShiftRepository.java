package com.staffly.work_schedule_service.repository;

import com.staffly.work_schedule_service.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    Optional<Shift> findByName(String name);

    boolean existsByName(String name);

    List<Shift> findByActiveTrue();
}