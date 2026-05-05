package com.auth_service.auth.config;

import com.auth_service.auth.entity.Role;
import com.auth_service.auth.entity.User;
import com.auth_service.auth.repository.RoleRepository;
import com.auth_service.auth.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.DependsOn;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
@DependsOn("flyway")
@RequiredArgsConstructor
public class DefaultAdminInitializer {


    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${DEFAULT_ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${DEFAULT_ADMIN_PASSWORD}")
    private String adminPassword;

    @PostConstruct
    public void init() {

        boolean adminExists = userRepository.existsByEmail(adminEmail);

        if (adminExists) {
            return;
        }

        Role adminRole = roleRepository.findByName("SYSTEM_ADMIN")
                .orElseThrow(() -> new RuntimeException("SYSTEM_ADMIN role not found"));

        User admin = User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .employeeId(null) // önemli
                .active(true)
                .createdAt(LocalDateTime.now())
                .roles(Set.of(adminRole))
                .build();

        userRepository.save(admin);

        System.out.println("DEFAULT ADMIN CREATED");
    }
}