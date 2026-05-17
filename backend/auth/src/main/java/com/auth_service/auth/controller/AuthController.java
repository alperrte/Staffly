package com.auth_service.auth.controller;

import com.auth_service.auth.dto.request.LoginRequest;
import com.auth_service.auth.dto.request.RegisterRequest;
import com.auth_service.auth.dto.request.SetPasswordRequest;
import com.auth_service.auth.dto.response.AuthResponse;
import com.auth_service.auth.service.AuthService;
import com.auth_service.auth.dto.request.ForgotPasswordRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(authService.register(request, authHeader));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody String refreshToken) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestBody String refreshToken,
            Authentication authentication
    ) {

        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        authService.logout(refreshToken);

        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestBody SetPasswordRequest request) {
        try {
            return ResponseEntity.ok(
                    authService.setPassword(request.getToken(), request.getPassword())
            );
        } catch (IllegalArgumentException e) {
            if ("SAME_PASSWORD".equals(e.getMessage())) {
                return ResponseEntity.badRequest().body("SAME_PASSWORD");
            }

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request.getEmail());

        return ResponseEntity.ok("Password reset link sent successfully");
    }
}
