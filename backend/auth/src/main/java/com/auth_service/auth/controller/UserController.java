package com.auth_service.auth.controller;

import com.auth_service.auth.entity.User;
import com.auth_service.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.auth_service.auth.entity.Role;
import com.auth_service.auth.repository.RoleRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;

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