package com.auth_service.auth.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth_service.auth.entity.Role;
import com.auth_service.auth.entity.User;
import com.auth_service.auth.repository.RoleRepository;
import com.auth_service.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

        @GetMapping("/me")
        public ResponseEntity<User> getCurrentUser(Authentication authentication) {
                if (authentication == null || authentication.getName() == null) {
                        return ResponseEntity.status(401).build();
                }

                User user = userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(user);
        }

    @PatchMapping("/{email}/active")
    public ResponseEntity<User> setActive(
            @PathVariable String email,
            @RequestBody Map<String, Boolean> body
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Boolean active = body.get("active");
        if (active != null) {
            user.setActive(active);
        }
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> deleteUser(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setActive(false);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{email}/roles")
    public ResponseEntity<User> setRoles(
            @PathVariable String email,
            @RequestBody Map<String, List<String>> body
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> roleNames = body.get("roles");

        Set<Role> roles = roleNames.stream()
                .map(name -> roleRepository.findByName(name)
                        .orElseThrow(() -> new RuntimeException("Role not found: " + name)))
                .collect(Collectors.toSet());

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}