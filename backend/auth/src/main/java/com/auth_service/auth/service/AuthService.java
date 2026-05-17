package com.auth_service.auth.service;

import com.auth_service.auth.dto.request.LoginRequest;
import com.auth_service.auth.dto.request.RegisterRequest;
import com.auth_service.auth.dto.response.EmployeeResponse;
import com.auth_service.auth.dto.response.AuthResponse;
import com.auth_service.auth.client.EmployeeClient;
import com.auth_service.auth.entity.RefreshToken;
import com.auth_service.auth.entity.ResetToken;
import com.auth_service.auth.entity.Role;
import com.auth_service.auth.entity.User;
import com.auth_service.auth.repository.RoleRepository;
import com.auth_service.auth.repository.UserRepository;
import com.auth_service.auth.security.JwtService;
import com.auth_service.auth.security.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final ResetTokenService resetTokenService;
    private final MailService mailService;
    private final EmployeeClient employeeClient;

    public AuthResponse register(RegisterRequest request, String authHeader) {

        if (request.getEmployeeId() == null) {
            throw new RuntimeException("Employee is required");
        }

        EmployeeResponse employee = employeeClient.getEmployeeById(authHeader, request.getEmployeeId());

        if (employee == null) {
            throw new RuntimeException("Employee not found");
        }

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new RuntimeException("Only active employees can be granted user access");
        }

        if (employee.getEmail() == null || employee.getEmail().isBlank()) {
            throw new RuntimeException("Employee email is required");
        }

        if (request.getEmail() != null &&
                !employee.getEmail().equalsIgnoreCase(request.getEmail())) {
            throw new RuntimeException("Employee email does not match request");
        }

        if (userRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getEmployeeId() != null &&
                userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("This employee already has a user account");
        }

        Set<Role> roles;

        if (request.getRoleNames() == null || request.getRoleNames().isEmpty()) {
            Role employeeRole = roleRepository.findByName("EMPLOYEE")
                    .orElseThrow(() -> new RuntimeException("Default role EMPLOYEE not found"));

            roles = Set.of(employeeRole);
        } else {
            roles = request.getRoleNames()
                    .stream()
                    .map(roleName -> roleRepository.findByName(roleName)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                    .collect(java.util.stream.Collectors.toSet());
        }

        User user = User.builder()
                .employeeId(request.getEmployeeId())
                .email(employee.getEmail())
                .password(null)
                .active(false)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        ResetToken resetToken = resetTokenService.createToken(savedUser);

        String setupPasswordLink =
                frontendBaseUrl + "/set-password?token=" + resetToken.getToken();

        System.out.println("PASSWORD SETUP LINK: " + setupPasswordLink);
        mailService.sendPasswordSetupMail(user.getEmail(), setupPasswordLink);

        return AuthResponse.builder()
                .accessToken("REGISTER_SUCCESS")
                .refreshToken("REGISTER_SUCCESS")
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

        String accessToken = jwtService.generateToken(userDetails, user.getId());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }
    public AuthResponse refresh(String refreshToken) {

        RefreshToken token = refreshTokenService.verifyRefreshToken(refreshToken);

        User user = token.getUser();

        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                                .toList()
                );

        String accessToken = jwtService.generateToken(userDetails, user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
    public void logout(String refreshToken) {

        RefreshToken token = refreshTokenService.verifyRefreshToken(refreshToken);

        User user = token.getUser();

        refreshTokenService.deleteByUser(user);
    }

    public AuthResponse setPassword(String token, String newPassword) {

        ResetToken resetToken = resetTokenService.verifyToken(token);

        User user = resetToken.getUser();

        if (user.getPassword() != null &&
                passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("SAME_PASSWORD");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setActive(true);

        userRepository.save(user);

        resetTokenService.markAsUsed(resetToken);

        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
                                .toList()
                );

        String accessToken = jwtService.generateToken(userDetails, user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ResetToken resetToken = resetTokenService.createToken(user);

        String resetPasswordLink =
                frontendBaseUrl + "/reset-password?token=" + resetToken.getToken();

        System.out.println("PASSWORD RESET LINK: " + resetPasswordLink);

        mailService.sendPasswordResetMail(user.getEmail(), resetPasswordLink);
    }
}
