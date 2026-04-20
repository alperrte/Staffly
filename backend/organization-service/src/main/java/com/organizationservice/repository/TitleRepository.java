package com.organizationservice.repository;

import com.organizationservice.entity.Title;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TitleRepository extends JpaRepository<Title, Long> {

    List<Title> findByDeletedFalse();
}