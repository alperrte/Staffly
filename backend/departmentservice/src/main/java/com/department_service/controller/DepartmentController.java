package com.department_service.controller;

import com.department_service.dto.request.CreateDepartmentRequest;
import com.department_service.dto.response.DepartmentPositionResponse;
import com.department_service.dto.response.DepartmentResponse;
import com.department_service.dto.response.SubDepartmentResponse;
import com.department_service.entity.Department;
import com.department_service.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping
    public DepartmentResponse createDepartment(@RequestBody CreateDepartmentRequest request) {
        return departmentService.createDepartment(request);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PutMapping("/{id}")
    public Department updateDepartment(@PathVariable Long id,
                                       @RequestBody Department department) {
        return departmentService.updateDepartment(id, department);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{departmentId}/sub-departments")
    public ResponseEntity<List<SubDepartmentResponse>> getSubDepartmentsByDepartmentId(
            @PathVariable Long departmentId
    ) {
        return ResponseEntity.ok(departmentService.getSubDepartmentsByDepartmentId(departmentId));
    }

    @GetMapping("/sub-departments/{subDepartmentId}/positions")
    public ResponseEntity<List<DepartmentPositionResponse>> getPositionsBySubDepartmentId(
            @PathVariable Long subDepartmentId
    ) {
        return ResponseEntity.ok(departmentService.getPositionsBySubDepartmentId(subDepartmentId));
    }

    @GetMapping("/sub-departments/{id}")
    public ResponseEntity<SubDepartmentResponse> getSubDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getSubDepartmentById(id));
    }

    @GetMapping("/positions/{id}")
    public ResponseEntity<DepartmentPositionResponse> getPositionById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getPositionById(id));
    }

    @GetMapping("/positions")
    public ResponseEntity<List<DepartmentPositionResponse>> getAllPositions() {
        return ResponseEntity.ok(departmentService.getAllPositions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(departmentService.getDepartmentById(id));
    }

    @GetMapping
    public List<DepartmentResponse> getAllDepartments() {
        return departmentService.getAllDepartments();
    }
}