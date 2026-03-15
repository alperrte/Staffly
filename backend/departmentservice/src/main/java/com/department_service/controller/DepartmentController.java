package com.department_service.controller;

import com.department_service.entity.Department;
import com.department_service.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.department_service.entity.DepartmentEmployee;
import com.department_service.dto.request.CreateDepartmentRequest;
import com.department_service.dto.response.DepartmentResponse;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public DepartmentResponse createDepartment(@RequestBody CreateDepartmentRequest request) {
        return departmentService.createDepartment(request);
    }

    @GetMapping
    public List<DepartmentResponse> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @PutMapping("/{id}")
    public Department updateDepartment(@PathVariable Long id,
                                       @RequestBody Department department) {
        return departmentService.updateDepartment(id, department);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {

        departmentService.deleteDepartment(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{departmentId}/employees/{employeeId}")
    public void assignEmployee(@PathVariable Long departmentId,
                               @PathVariable Long employeeId) {

        departmentService.assignEmployeeToDepartment(departmentId, employeeId);
    }

    @GetMapping("/{departmentId}/employees")
    public List<DepartmentEmployee> getEmployeesByDepartment(@PathVariable Long departmentId) {
        return departmentService.getEmployeesByDepartment(departmentId);
    }

}