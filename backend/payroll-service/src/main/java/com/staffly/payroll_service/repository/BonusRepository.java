package com.staffly.payroll_service.repository;

import com.staffly.payroll_service.entity.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BonusRepository extends JpaRepository<Bonus, Long> {

    long countByEmployeeId(Long employeeId);

    // 🔥 sadece belirli ay aralığı
    List<Bonus> findByEmployeeIdAndCreatedAtBetween(
            Long employeeId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Bonus> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}