package com.employee_service.employee.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.employee_service.employee.client.EmployeeDepartmentClient;
import com.employee_service.employee.dto.request.CreateEmployeeRequest;
import com.employee_service.employee.dto.request.UpdateEmployeeRequest;
import com.employee_service.employee.dto.request.UpdateMyProfileRequest;
import com.employee_service.employee.dto.response.EmployeeResponse;
import com.employee_service.employee.entity.Employee;
import com.employee_service.employee.entity.EmployeeJobInfo;
import com.employee_service.employee.entity.EmployeePersonalInfo;
import com.employee_service.employee.repository.EmployeeJobInfoRepository;
import com.employee_service.employee.repository.EmployeePersonalInfoRepository;
import com.employee_service.employee.repository.EmployeeRepository;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

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
                .medeniDurum(request.getMedeniDurum())
                .tc(request.getTc())
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

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }

    public EmployeeResponse updateMyProfile(
            String email,
            UpdateMyProfileRequest request
    ) {

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        EmployeePersonalInfo personalInfo =
                personalInfoRepository.findByEmployeeId(employee.getId())
                        .orElse(EmployeePersonalInfo.builder()
                                .employeeId(employee.getId())
                                .build());

        if (request.getEmail() != null) {
            employee.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            personalInfo.setPhone(request.getPhone());
        }

        employee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(employee);
        personalInfoRepository.save(personalInfo);

        EmployeeJobInfo jobInfo =
                jobInfoRepository.findByEmployeeId(employee.getId()).orElse(null);

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }

    public EmployeeResponse uploadProfileImage(
            String email,
            MultipartFile file
    ) {

        try {

            Employee employee = employeeRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            String uploadDir = System.getProperty("user.dir")
                    + "/uploads/profile-images";

            java.io.File directory = new java.io.File(uploadDir);

            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName =
                    System.currentTimeMillis() + "_" + file.getOriginalFilename();

            String filePath = uploadDir + "/" + fileName;
            String dbPath = "uploads/profile-images/" + fileName;

            file.transferTo(new java.io.File(filePath));

            employee.setProfileImage(dbPath);
            employee.setUpdatedAt(LocalDateTime.now());

            employeeRepository.save(employee);

            EmployeePersonalInfo personalInfo =
                    personalInfoRepository.findByEmployeeId(employee.getId())
                            .orElse(null);

            EmployeeJobInfo jobInfo =
                    jobInfoRepository.findByEmployeeId(employee.getId())
                            .orElse(null);

            return buildEmployeeResponse(employee, personalInfo, jobInfo);

        }
        catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    public EmployeeResponse removeProfileImage(String email) {

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setProfileImage(null);
        employee.setUpdatedAt(LocalDateTime.now());

        employeeRepository.save(employee);

        EmployeePersonalInfo personalInfo =
                personalInfoRepository.findByEmployeeId(employee.getId())
                        .orElse(null);

        EmployeeJobInfo jobInfo =
                jobInfoRepository.findByEmployeeId(employee.getId())
                        .orElse(null);

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }

    public EmployeeResponse getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        EmployeePersonalInfo personalInfo =
                personalInfoRepository.findByEmployeeId(employee.getId()).orElse(null);

        EmployeeJobInfo jobInfo =
                jobInfoRepository.findByEmployeeId(employee.getId()).orElse(null);

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }

    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findByIsDeletedFalse()
                .stream()
                .map(employee -> buildEmployeeResponse(
                        employee,
                        personalInfoRepository.findByEmployeeId(employee.getId()).orElse(null),
                        jobInfoRepository.findByEmployeeId(employee.getId()).orElse(null)
                ))
                .toList();
    }

    public List<EmployeeResponse> getEmployeesByDepartment(Long departmentId) {

        return employeeRepository.findByIsDeletedFalse()
                .stream()
                .filter(employee -> {
                    EmployeeJobInfo jobInfo = jobInfoRepository.findByEmployeeId(employee.getId()).orElse(null);
                    return jobInfo != null && jobInfo.getDepartmentId() != null && jobInfo.getDepartmentId().equals(departmentId);
                })
                .map(employee -> buildEmployeeResponse(
                        employee,
                        personalInfoRepository.findByEmployeeId(employee.getId()).orElse(null),
                        jobInfoRepository.findByEmployeeId(employee.getId()).orElse(null)
                ))
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
        if (request.getMedeniDurum() != null) personalInfo.setMedeniDurum(request.getMedeniDurum());
        if (request.getTc() != null) personalInfo.setTc(request.getTc());

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
    private EmployeeResponse buildEmployeeResponse(
            Employee employee,
            EmployeePersonalInfo personalInfo,
            EmployeeJobInfo jobInfo
    ) {
        Long departmentId = jobInfo != null ? jobInfo.getDepartmentId() : null;
        Long positionId = jobInfo != null ? jobInfo.getPositionId() : null;

                Long subDepartmentId = null;
                Long managerId = null;
                String departmentName = null;
                String subDepartmentName = null;
                String positionName = null;

                if (departmentId != null) {
                        departmentName = employeeDepartmentClient.getDepartmentName(departmentId);
                }

                if (positionId != null) {
                        var position = employeeDepartmentClient.getPositionById(positionId);
                        if (position != null) {
                                Object rawSubDepartmentId = position.get("subDepartmentId");
                                if (rawSubDepartmentId instanceof Number number) {
                                        subDepartmentId = number.longValue();
                                }

                                Object rawPositionName = position.get("name");
                                if (rawPositionName != null) {
                                        positionName = String.valueOf(rawPositionName);
                                }
                        }
                }

                if (subDepartmentId != null) {
                        subDepartmentName = employeeDepartmentClient.getSubDepartmentName(subDepartmentId);
                        var subDepartment = employeeDepartmentClient.getSubDepartmentById(subDepartmentId);
                        if (subDepartment != null) {
                                Object rawManagerId = subDepartment.get("managerId");
                                if (rawManagerId instanceof Number number) {
                                        managerId = number.longValue();
                                }
                        }
                } else if (departmentId != null) {
                        var department = employeeDepartmentClient.getDepartmentById(departmentId);
                        if (department != null) {
                                Object rawManagerId = department.get("managerId");
                                if (rawManagerId instanceof Number number) {
                                        managerId = number.longValue();
                                }
                        }
                }

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
                .medeniDurum(personalInfo != null ? personalInfo.getMedeniDurum() : null)
                .tc(personalInfo != null ? personalInfo.getTc() : null)
                .departmentId(departmentId)
                .departmentName(departmentName)
                .subDepartmentId(subDepartmentId)
                .subDepartmentName(subDepartmentName)
                .positionId(positionId)
                .positionName(positionName)
                .titleName(positionName)
                .managerId(managerId)
                .managerName(null)
                .profileImage(employee.getProfileImage())
                .profilePhotoUrl(employee.getProfileImage())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }
    public EmployeeResponse uploadEmployeeProfileImage(

            Long id,
            MultipartFile file
    ) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        String uploadDir = "uploads/profile-images/";

        File dir = new File(uploadDir);

        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName =
                System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Path path = Paths.get(uploadDir + fileName);

        try {
            Files.write(path, file.getBytes());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        employee.setProfileImage(uploadDir + fileName);
        employeeRepository.save(employee);

        EmployeePersonalInfo personalInfo =
                personalInfoRepository.findByEmployeeId(employee.getId())
                        .orElse(null);

        EmployeeJobInfo jobInfo =
                jobInfoRepository.findByEmployeeId(employee.getId())
                        .orElse(null);

        return buildEmployeeResponse(employee, personalInfo, jobInfo);
    }
}
