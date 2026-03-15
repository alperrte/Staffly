package com.employee_service.employee.service;

import com.employee_service.employee.dto.request.CreateEmployeeRequest;
import com.employee_service.employee.dto.request.UpdateEmployeeRequest;
import com.employee_service.employee.dto.response.EmployeeResponse;
import com.employee_service.employee.entity.Employee;
import com.employee_service.employee.entity.EmployeeJobInfo;
import com.employee_service.employee.entity.EmployeePersonalInfo;
import com.employee_service.employee.repository.EmployeeJobInfoRepository;
import com.employee_service.employee.repository.EmployeePersonalInfoRepository;
import com.employee_service.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeePersonalInfoRepository personalInfoRepository;
    private final EmployeeJobInfoRepository jobInfoRepository;

    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {

        Employee employee = Employee.builder()
                .employeeNumber(request.getEmployeeNumber())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .hireDate(request.getHireDate())
                .status(request.getStatus())
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .build();

        employeeRepository.save(employee);

        EmployeePersonalInfo personalInfo = EmployeePersonalInfo.builder()
                .employeeId(employee.getId())
                .phone(request.getPhone())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .build();

        personalInfoRepository.save(personalInfo);

        EmployeeJobInfo jobInfo = EmployeeJobInfo.builder()
                .employeeId(employee.getId())
                .departmentId(request.getDepartmentId())
                .positionName(request.getPositionName())
                .build();

        jobInfoRepository.save(jobInfo);

        return mapToResponse(employee, request);
    }

    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id).orElseThrow();

        return mapToResponse(employee, null);
    }

    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(employee -> EmployeeResponse.builder()
                        .id(employee.getId())
                        .employeeNumber(employee.getEmployeeNumber())
                        .firstName(employee.getFirstName())
                        .lastName(employee.getLastName())
                        .email(employee.getEmail())
                        .hireDate(employee.getHireDate())
                        .status(employee.getStatus())
                        .build())
                .toList();
    }

    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {

        Employee employee = employeeRepository.findById(id).orElseThrow();

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setStatus(request.getStatus());
        employee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(employee);

        return mapToResponse(employee, null);
    }

    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id).orElseThrow();

        employee.setIsDeleted(true);


        employeeRepository.save(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee, CreateEmployeeRequest request) {

        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeNumber(employee.getEmployeeNumber())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .hireDate(employee.getHireDate())
                .status(employee.getStatus())
                .phone(request != null ? request.getPhone() : null)
                .birthDate(request != null ? request.getBirthDate() : null)
                .gender(request != null ? request.getGender() : null)
                .departmentId(request != null ? request.getDepartmentId() : null)
                .positionName(request != null ? request.getPositionName() : null)
                .build();
    }
}