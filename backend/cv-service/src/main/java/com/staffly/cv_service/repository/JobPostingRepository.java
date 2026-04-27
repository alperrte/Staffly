package com.staffly.cv_service.repository;

import com.staffly.cv_service.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {

    List<JobPosting> findByIsDeletedFalse();

    List<JobPosting> findByStatusAndIsDeletedFalse(String status);

    List<JobPosting> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(String status);
}