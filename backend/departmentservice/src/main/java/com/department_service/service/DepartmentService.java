package com.department_service.service;

import com.department_service.entity.Department;
import com.department_service.repository.DepartmentRepository;
import com.department_service.entity.DepartmentEmployee;
import com.department_service.repository.DepartmentEmployeeRepository;
import com.department_service.dto.request.CreateDepartmentRequest;
import com.department_service.dto.response.DepartmentResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentEmployeeRepository departmentEmployeeRepository;

    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {

        Department department = new Department();
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setManagerId(request.getManagerId());
        department.setDeleted(false);

        Department savedDepartment = departmentRepository.save(department);

        DepartmentResponse response = new DepartmentResponse();
        response.setId(savedDepartment.getId());
        response.setName(savedDepartment.getName());
        response.setDescription(savedDepartment.getDescription());
        response.setManagerId(savedDepartment.getManagerId());

        return response;
    }

    public List<DepartmentResponse> getAllDepartments() {

        List<Department> departments = departmentRepository.findByDeletedFalse();

        return departments.stream().map(department -> {
            DepartmentResponse response = new DepartmentResponse();
            response.setId(department.getId());
            response.setName(department.getName());
            response.setDescription(department.getDescription());
            response.setManagerId(department.getManagerId());
            return response;
        }).toList();
    }

    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        existingDepartment.setName(department.getName());
        existingDepartment.setDescription(department.getDescription());
        existingDepartment.setManagerId(department.getManagerId());

        return departmentRepository.save(existingDepartment);
    }

    public void deleteDepartment(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        department.setDeleted(true);

        departmentRepository.save(department);
    }

    public void assignEmployeeToDepartment(Long departmentId, Long employeeId) {

        DepartmentEmployee departmentEmployee = new DepartmentEmployee();

        departmentEmployee.setDepartmentId(departmentId);
        departmentEmployee.setEmployeeId(employeeId);

        departmentEmployeeRepository.save(departmentEmployee);
    }

    public List<DepartmentEmployee> getEmployeesByDepartment(Long departmentId) {
        return departmentEmployeeRepository.findByDepartmentId(departmentId);
    }



}