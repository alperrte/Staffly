package com.department_service.service;

import com.department_service.dto.CreateDepartmentRequest;
import com.department_service.dto.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse createDepartment(CreateDepartmentRequest request);

    List<DepartmentResponse> getAllDepartments();

}