package com.employee_service.employee.controller;

import com.employee_service.employee.client.AuthClient;
import com.employee_service.employee.dto.request.CreateEmployeeRequest;
import com.employee_service.employee.dto.request.UpdateEmployeeRequest;
import com.employee_service.employee.dto.request.UpdateMyProfileRequest;
import com.employee_service.employee.dto.response.EmployeeResponse;
import com.employee_service.employee.security.JwtService;
import com.employee_service.employee.service.EmployeeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;
    private final JwtService jwtService;
    private final AuthClient authClient;

    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_HR_MANAGER')")
    @PostMapping
    public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @GetMapping("/me")
    public EmployeeResponse getMyProfile(Authentication authentication) {

        String email = authentication.getName();

        return employeeService.getEmployeeByEmail(email);
    }

    @PatchMapping("/me")
    public EmployeeResponse updateMyProfile(
            Authentication authentication,
            @RequestBody UpdateMyProfileRequest request
    ) {

        String email = authentication.getName();

        return employeeService.updateMyProfile(email, request);
    }

    @PostMapping("/me/profile-image")
    public EmployeeResponse uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {

        String email = authentication.getName();

        return employeeService.uploadProfileImage(email, file);
    }

    @PatchMapping("/me/profile-image/remove")
    public EmployeeResponse removeMyProfileImage(Authentication authentication) {

        String email = authentication.getName();

        return employeeService.removeProfileImage(email);
    }

    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_SYSTEM_ADMIN',
            'ROLE_HR_MANAGER',
            'ROLE_ACCOUNTING',
            'ROLE_DEPARTMENT_MANAGER',
            'ROLE_MANAGER'
        )
    """)
    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        EmployeeResponse employee = employeeService.getEmployeeById(id);
        assertDepartmentManagerCanAccess(employee, authHeader);
        return employee;
    }

    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_SYSTEM_ADMIN',
            'ROLE_HR_MANAGER',
            'ROLE_ACCOUNTING',
            'ROLE_DEPARTMENT_MANAGER',
            'ROLE_MANAGER'
        )
    """)
    @GetMapping("/by-email/{email}")
    public EmployeeResponse getEmployeeByEmail(
            @PathVariable String email,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        EmployeeResponse employee = employeeService.getEmployeeByEmail(email);
        assertDepartmentManagerCanAccess(employee, authHeader);
        return employee;
    }

    @PreAuthorize("""
        hasAnyAuthority(
            'ROLE_SYSTEM_ADMIN',
            'ROLE_HR_MANAGER',
            'ROLE_ACCOUNTING',
            'ROLE_DEPARTMENT_MANAGER',
            'ROLE_MANAGER'
        )
    """)
    @GetMapping
    public List<EmployeeResponse> getAllEmployees(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {

        if (authHeader != null && !authHeader.isBlank()) {

            String token = authHeader.startsWith("Bearer ")
                    ? authHeader.substring(7)
                    : authHeader;

            List<String> roles = jwtService.extractRoles(token);

            boolean isDeptManager = roles.stream().anyMatch(r ->
                    r.equalsIgnoreCase("ROLE_DEPARTMENT_MANAGER")
                            || r.equalsIgnoreCase("DEPARTMENT_MANAGER")
            );

            if (isDeptManager) {

                var current = authClient.getCurrentUser(authHeader);

                if (current != null && current.getEmployeeId() != null) {

                    var managerInfo =
                            employeeService.getEmployeeById(current.getEmployeeId());

                    if (managerInfo != null
                            && managerInfo.getDepartmentId() != null) {

                        return employeeService.getEmployeesByDepartment(
                                managerInfo.getDepartmentId()
                        );
                    }
                }
            }
        }

        return employeeService.getAllEmployees();
    }

    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_HR_MANAGER')")
    @PostMapping("/{id}/profile-image")
    public EmployeeResponse uploadEmployeeProfileImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {

        return employeeService.uploadEmployeeProfileImage(id, file);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_HR_MANAGER')")
    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(
            @PathVariable Long id,
            @RequestBody UpdateEmployeeRequest request
    ) {
        return employeeService.updateEmployee(id, request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_HR_MANAGER')")
    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }

    private void assertDepartmentManagerCanAccess(
            EmployeeResponse employee,
            String authHeader
    ) {
        if (!isDepartmentManager(authHeader)) {
            return;
        }

        Long managedDepartmentId = getManagedDepartmentId(authHeader);

        if (managedDepartmentId == null
                || employee.getDepartmentId() == null
                || !managedDepartmentId.equals(employee.getDepartmentId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private boolean isDepartmentManager(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return false;
        }

        String token = authHeader.startsWith("Bearer ")
                ? authHeader.substring(7)
                : authHeader;

        return jwtService.extractRoles(token).stream().anyMatch(r ->
                r.equalsIgnoreCase("ROLE_DEPARTMENT_MANAGER")
                        || r.equalsIgnoreCase("DEPARTMENT_MANAGER")
        );
    }

    private Long getManagedDepartmentId(String authHeader) {
        var current = authClient.getCurrentUser(authHeader);

        if (current == null || current.getEmployeeId() == null) {
            return null;
        }

        var managerInfo = employeeService.getEmployeeById(current.getEmployeeId());

        return managerInfo != null ? managerInfo.getDepartmentId() : null;
    }
}
