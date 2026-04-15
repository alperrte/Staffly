package com.staffly.cv_service.repository;

import com.staffly.cv_service.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByEmail(String email);

    List<Application> findByStatus(String status);

    Optional<Application> findByIdAndEmail(Long id, String email);
}
