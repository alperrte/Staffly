package com.auth_service.auth.service;

import com.auth_service.auth.entity.ResetToken;
import com.auth_service.auth.entity.User;
import com.auth_service.auth.repository.ResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResetTokenService {

    private final ResetTokenRepository resetTokenRepository;

    @Value("${PASSWORD_RESET_TOKEN_EXPIRATION}")
    private long resetTokenExpiration;

    public ResetToken createToken(User user) {

        ResetToken resetToken = ResetToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusSeconds(resetTokenExpiration / 1000))
                .used(false)
                .build();

        return resetTokenRepository.save(resetToken);
    }

    public ResetToken verifyToken(String token) {

        ResetToken resetToken = resetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new RuntimeException("Token already used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        return resetToken;
    }

    public void markAsUsed(ResetToken resetToken) {
        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }
}