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

    @Value("${DEFAULT_SYSTEM_ADMIN_EMAIL}")
    private String systemAdminEmail;

    @Value("${DEFAULT_SYSTEM_ADMIN_PASSWORD}")
    private String systemAdminPassword;

    @Value("${DEFAULT_HR_MANAGER_EMAIL}")
    private String hrManagerEmail;

    @Value("${DEFAULT_HR_MANAGER_PASSWORD}")
    private String hrManagerPassword;

    @Value("${DEFAULT_DEPARTMENT_MANAGER_EMAIL}")
    private String departmentManagerEmail;

    @Value("${DEFAULT_DEPARTMENT_MANAGER_PASSWORD}")
    private String departmentManagerPassword;

    @Value("${DEFAULT_EMPLOYEE_EMAIL}")
    private String employeeEmail;

    @Value("${DEFAULT_EMPLOYEE_PASSWORD}")
    private String employeePassword;

    @PostConstruct
    public void init() {

        createDefaultUser(
                systemAdminEmail,
                systemAdminPassword,
                "SYSTEM_ADMIN"
        );

        createDefaultUser(
                hrManagerEmail,
                hrManagerPassword,
                "HR_MANAGER"
        );

        createDefaultUser(
                departmentManagerEmail,
                departmentManagerPassword,
                "DEPARTMENT_MANAGER"
        );

        createDefaultUser(
                employeeEmail,
                employeePassword,
                "EMPLOYEE"
        );

        System.out.println("DEFAULT USERS INITIALIZED");
    }

    private void createDefaultUser(
            String email,
            String password,
            String roleName
    ) {

        boolean exists = userRepository.existsByEmail(email);

        if (exists) {
            System.out.println(email + " already exists");
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() ->
                        new RuntimeException(roleName + " role not found"));

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .employeeId(null)
                .active(true)
                .createdAt(LocalDateTime.now())
                .roles(Set.of(role))
                .build();

        userRepository.save(user);

        System.out.println(roleName + " DEFAULT USER CREATED");
    }
}