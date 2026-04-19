package com.employee_service.employee.service;

import com.employee_service.employee.client.EmployeeDepartmentClient;
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
    private final EmployeeDepartmentClient employeeDepartmentClient;


    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {

        if (!employeeDepartmentClient.isDepartmentExists(request.getDepartmentId())) {
            throw new RuntimeException("Department not found!");
        }

        if (!employeeDepartmentClient.isPositionUnderDepartment(request.getDepartmentId(), request.getPositionId())) {
            throw new RuntimeException("Position not found in selected department!");
        }

        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .hireDate(request.getHireDate())
                .status("ACTIVE")
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
                .positionId(request.getPositionId())
                .build();

        jobInfoRepository.save(jobInfo);

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }

    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id).orElseThrow();

        EmployeePersonalInfo personalInfo =
                personalInfoRepository.findByEmployeeId(id).orElse(null);

        EmployeeJobInfo jobInfo =
                jobInfoRepository.findByEmployeeId(id).orElse(null);

        return EmployeeResponse.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .hireDate(employee.getHireDate())
                .status(employee.getStatus())
                .phone(personalInfo != null ? personalInfo.getPhone() : null)
                .birthDate(personalInfo != null ? personalInfo.getBirthDate() : null)
                .gender(personalInfo != null ? personalInfo.getGender() : null)
                .departmentId(jobInfo != null ? jobInfo.getDepartmentId() : null)
                .positionId(jobInfo != null ? jobInfo.getPositionId() : null)
                .build();
    }

    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findByIsDeletedFalse()
                .stream()
                .map(employee -> {

                    EmployeePersonalInfo personalInfo =
                            personalInfoRepository.findByEmployeeId(employee.getId()).orElse(null);

                    EmployeeJobInfo jobInfo =
                            jobInfoRepository.findByEmployeeId(employee.getId()).orElse(null);

                    return EmployeeResponse.builder()
                            .id(employee.getId())
                            .firstName(employee.getFirstName())
                            .lastName(employee.getLastName())
                            .email(employee.getEmail())
                            .hireDate(employee.getHireDate())
                            .status(employee.getStatus())
                            .phone(personalInfo != null ? personalInfo.getPhone() : null)
                            .birthDate(personalInfo != null ? personalInfo.getBirthDate() : null)
                            .gender(personalInfo != null ? personalInfo.getGender() : null)
                            .departmentId(jobInfo != null ? jobInfo.getDepartmentId() : null)
                            .positionId(jobInfo != null ? jobInfo.getPositionId() : null)
                            .build();
                })
                .toList();
    }

    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {

        Employee employee = employeeRepository.findById(id).orElseThrow();

        EmployeePersonalInfo personalInfo =
                personalInfoRepository.findByEmployeeId(id)
                        .orElse(EmployeePersonalInfo.builder().employeeId(id).build());

        EmployeeJobInfo jobInfo =
                jobInfoRepository.findByEmployeeId(id)
                        .orElse(EmployeeJobInfo.builder().employeeId(id).build());

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getEmail() != null) employee.setEmail(request.getEmail());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());

        if (request.getPhone() != null) personalInfo.setPhone(request.getPhone());
        if (request.getBirthDate() != null) personalInfo.setBirthDate(request.getBirthDate());
        if (request.getGender() != null) personalInfo.setGender(request.getGender());

        if (request.getDepartmentId() != null) {
            if (!employeeDepartmentClient.isDepartmentExists(request.getDepartmentId())) {
                throw new RuntimeException("Department not found!");
            }
            jobInfo.setDepartmentId(request.getDepartmentId());
        }

        if (request.getPositionId() != null) {
            Long departmentIdToValidate =
                    request.getDepartmentId() != null ? request.getDepartmentId() : jobInfo.getDepartmentId();

            if (departmentIdToValidate == null) {
                throw new RuntimeException("Department is required before updating position!");
            }

            if (!employeeDepartmentClient.isPositionUnderDepartment(departmentIdToValidate, request.getPositionId())) {
                throw new RuntimeException("Position not found in selected department!");
            }

            jobInfo.setPositionId(request.getPositionId());
        }

        employee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(employee);
        personalInfoRepository.save(personalInfo);
        jobInfoRepository.save(jobInfo);

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }

    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id).orElseThrow();

        employee.setIsDeleted(true);
        employee.setStatus("PASSIVE");
        employee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(employee);
    }

    private EmployeeResponse mapToResponse(Employee employee, CreateEmployeeRequest request) {

        return EmployeeResponse.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .hireDate(employee.getHireDate())
                .status(employee.getStatus())
                .phone(request != null ? request.getPhone() : null)
                .birthDate(request != null ? request.getBirthDate() : null)
                .gender(request != null ? request.getGender() : null)
                .departmentId(request != null ? request.getDepartmentId() : null)
                .positionId(request != null ? request.getPositionId() : null)
                .build();
    }
    private EmployeeResponse buildEmployeeResponse(
            Employee employee,
            EmployeePersonalInfo personalInfo,
            EmployeeJobInfo jobInfo
    ) {
        Long departmentId = jobInfo != null ? jobInfo.getDepartmentId() : null;
        Long positionId = jobInfo != null ? jobInfo.getPositionId() : null;

        return EmployeeResponse.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .hireDate(employee.getHireDate())
                .status(employee.getStatus())
                .phone(personalInfo != null ? personalInfo.getPhone() : null)
                .birthDate(personalInfo != null ? personalInfo.getBirthDate() : null)
                .gender(personalInfo != null ? personalInfo.getGender() : null)
                .departmentId(departmentId)
                .departmentName(departmentId != null ? employeeDepartmentClient.getDepartmentName(departmentId) : null)
                .positionId(positionId)
                .positionName(
                        departmentId != null && positionId != null
                                ? employeeDepartmentClient.getPositionNameByDepartment(departmentId, positionId)
                                : null
                )
                .build();
    }
}