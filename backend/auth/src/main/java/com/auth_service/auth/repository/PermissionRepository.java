package com.auth_service.auth.repository;

import com.auth_service.auth.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission,Long> {

    Optional<Permission> findByName(String name);

}
