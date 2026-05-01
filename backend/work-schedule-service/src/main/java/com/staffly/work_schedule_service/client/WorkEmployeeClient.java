package com.staffly.work_schedule_service.client;

import com.staffly.work_schedule_service.client.response.EmployeeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkEmployeeClient {

    private final RestTemplate restTemplate;

    @Value("${employee.service.url}")
    private String employeeServiceUrl;

    public EmployeeResponse getEmployeeById(Long employeeId) {
        String url = employeeServiceUrl + "/api/v1/employees/" + employeeId;

        return restTemplate.getForObject(url, EmployeeResponse.class);
    }

    public List<EmployeeResponse> getAllEmployees() {
        String url = employeeServiceUrl + "/api/v1/employees";

        EmployeeResponse[] response = restTemplate.getForObject(
                url,
                EmployeeResponse[].class
        );

        if (response == null) {
            return List.of();
        }

        return Arrays.asList(response);
    }

    public List<EmployeeResponse> getEmployeesByDepartmentId(Long departmentId) {
        return getAllEmployees()
                .stream()
                .filter(employee -> employee.getDepartmentId() != null)
                .filter(employee -> employee.getDepartmentId().equals(departmentId))
                .toList();
    }
}