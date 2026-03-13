package com.auth_service.auth.service;

import com.auth_service.auth.dto.request.LoginRequest;
import com.auth_service.auth.dto.request.RegisterRequest;
import com.auth_service.auth.dto.response.AuthResponse;
import com.auth_service.auth.entity.RefreshToken;
import com.auth_service.auth.entity.Role;
import com.auth_service.auth.entity.User;
import com.auth_service.auth.repository.RoleRepository;
import com.auth_service.auth.repository.UserRepository;
import com.auth_service.auth.security.JwtService;
import com.auth_service.auth.security.RefreshTokenService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .roles(Set.of(role))
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .access_token("REGISTER_SUCCESS")
                .refresh_token("REGISTER_SUCCESS")
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getActive()) {
            throw new RuntimeException("User is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }


        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                                .toList()
                );

        String accessToken = jwtService.generateToken(userDetails);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .access_token(accessToken)
                .refresh_token(refreshToken.getToken())
                .build();
    }
}