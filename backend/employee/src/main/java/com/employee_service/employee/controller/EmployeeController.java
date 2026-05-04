package com.employee_service.employee.controller;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee_service.employee.dto.request.CreateEmployeeRequest;
import com.employee_service.employee.dto.request.UpdateEmployeeRequest;
import com.employee_service.employee.dto.response.EmployeeResponse;
import com.employee_service.employee.service.EmployeeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public EmployeeResponse createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        return employeeService.createEmployee(request);
    }

    @GetMapping("/{id}")
    public EmployeeResponse getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @GetMapping("/by-email/{email}")
    public EmployeeResponse getEmployeeByEmail(@PathVariable String email) {
        return employeeService.getEmployeeByEmail(email);
    }

    @GetMapping
    public List<EmployeeResponse> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @PutMapping("/{id}")
    public EmployeeResponse updateEmployee(@PathVariable Long id,
                                           @RequestBody UpdateEmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }
}