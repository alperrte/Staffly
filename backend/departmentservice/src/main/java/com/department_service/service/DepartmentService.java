package com.department_service.service;

import com.department_service.dto.request.CreateDepartmentRequest;
import com.department_service.dto.request.DepartmentPositionRequest;
import com.department_service.dto.request.SubDepartmentRequest;
import com.department_service.dto.response.DepartmentPositionResponse;
import com.department_service.dto.response.DepartmentResponse;
import com.department_service.dto.response.SubDepartmentResponse;
import com.department_service.entity.Department;
import com.department_service.entity.DepartmentPosition;
import com.department_service.entity.SubDepartment;
import com.department_service.repository.DepartmentPositionRepository;
import com.department_service.repository.DepartmentRepository;
import com.department_service.repository.SubDepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final SubDepartmentRepository subDepartmentRepository;
    private final DepartmentPositionRepository departmentPositionRepository;

    // ✅ CREATE
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {

        Department department = new Department();
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setManagerId(request.getManagerId());
        department.setDeleted(false);

        Department savedDepartment = departmentRepository.save(department);

        List<SubDepartmentResponse> subDepartmentResponses = new ArrayList<>();

        if (request.getSubDepartments() != null && !request.getSubDepartments().isEmpty()) {

            for (SubDepartmentRequest subDepartmentRequest : request.getSubDepartments()) {

                SubDepartment subDepartment = new SubDepartment();
                subDepartment.setDepartmentId(savedDepartment.getId());
                subDepartment.setName(subDepartmentRequest.getName());
                subDepartment.setDescription(subDepartmentRequest.getDescription());
                subDepartment.setManagerId(subDepartmentRequest.getManagerId());
                subDepartment.setDeleted(false);

                SubDepartment savedSubDepartment = subDepartmentRepository.save(subDepartment);

                List<DepartmentPositionResponse> positionResponses = new ArrayList<>();

                if (subDepartmentRequest.getPositions() != null && !subDepartmentRequest.getPositions().isEmpty()) {

                    for (DepartmentPositionRequest positionRequest : subDepartmentRequest.getPositions()) {

                        DepartmentPosition departmentPosition = new DepartmentPosition();
                        departmentPosition.setSubDepartmentId(savedSubDepartment.getId());
                        departmentPosition.setName(positionRequest.getName());
                        departmentPosition.setDescription(positionRequest.getDescription());
                        departmentPosition.setDeleted(false);

                        DepartmentPosition savedPosition = departmentPositionRepository.save(departmentPosition);

                        DepartmentPositionResponse positionResponse = new DepartmentPositionResponse();
                        positionResponse.setId(savedPosition.getId());
                        positionResponse.setName(savedPosition.getName());
                        positionResponse.setDescription(savedPosition.getDescription());

                        positionResponses.add(positionResponse);
                    }
                }

                SubDepartmentResponse subDepartmentResponse = new SubDepartmentResponse();
                subDepartmentResponse.setId(savedSubDepartment.getId());
                subDepartmentResponse.setName(savedSubDepartment.getName());
                subDepartmentResponse.setDescription(savedSubDepartment.getDescription());
                subDepartmentResponse.setManagerId(savedSubDepartment.getManagerId());
                subDepartmentResponse.setPositions(positionResponses);

                subDepartmentResponses.add(subDepartmentResponse);
            }
        }

        DepartmentResponse response = new DepartmentResponse();
        response.setId(savedDepartment.getId());
        response.setName(savedDepartment.getName());
        response.setDescription(savedDepartment.getDescription());
        response.setManagerId(savedDepartment.getManagerId());
        response.setSubDepartments(subDepartmentResponses);

        return response;
    }

    // ✅ GET ALL
    public List<DepartmentResponse> getAllDepartments() {

        List<Department> departments = departmentRepository.findByDeletedFalse();

        return departments.stream().map(department -> {

            DepartmentResponse response = new DepartmentResponse();
            response.setId(department.getId());
            response.setName(department.getName());
            response.setDescription(department.getDescription());
            response.setManagerId(department.getManagerId());

            List<SubDepartment> subDepartments =
                    subDepartmentRepository.findByDepartmentIdAndDeletedFalse(department.getId());

            List<SubDepartmentResponse> subDepartmentResponses = subDepartments.stream().map(subDepartment -> {

                SubDepartmentResponse subDepartmentResponse = new SubDepartmentResponse();
                subDepartmentResponse.setId(subDepartment.getId());
                subDepartmentResponse.setName(subDepartment.getName());
                subDepartmentResponse.setDescription(subDepartment.getDescription());
                subDepartmentResponse.setManagerId(subDepartment.getManagerId());

                List<DepartmentPosition> positions =
                        departmentPositionRepository.findBySubDepartmentIdAndDeletedFalse(subDepartment.getId());

                List<DepartmentPositionResponse> positionResponses = positions.stream().map(position -> {

                    DepartmentPositionResponse positionResponse = new DepartmentPositionResponse();
                    positionResponse.setId(position.getId());
                    positionResponse.setName(position.getName());
                    positionResponse.setDescription(position.getDescription());

                    return positionResponse;
                }).toList();

                subDepartmentResponse.setPositions(positionResponses);

                return subDepartmentResponse;

            }).toList();

            response.setSubDepartments(subDepartmentResponses);

            return response;

        }).toList();
    }

    // ✅ UPDATE
    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        existingDepartment.setName(department.getName());
        existingDepartment.setDescription(department.getDescription());
        existingDepartment.setManagerId(department.getManagerId());

        return departmentRepository.save(existingDepartment);
    }

    // ✅ DELETE (SOFT)
    public void deleteDepartment(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        department.setDeleted(true);

        departmentRepository.save(department);
    }
}