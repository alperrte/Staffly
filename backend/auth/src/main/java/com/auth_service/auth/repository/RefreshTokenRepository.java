package com.auth_service.auth.repository;

import com.auth_service.auth.entity.RefreshToken;
import com.auth_service.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);
}
