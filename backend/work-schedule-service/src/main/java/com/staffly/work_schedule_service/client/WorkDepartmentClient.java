package com.staffly.work_schedule_service.client;

import com.staffly.work_schedule_service.client.response.DepartmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class WorkDepartmentClient {

    private final RestTemplate restTemplate;

    @Value("${department.service.url}")
    private String departmentServiceUrl;

    public DepartmentResponse getDepartmentById(Long departmentId) {
        String url = departmentServiceUrl + "/departments/" + departmentId;

        return restTemplate.getForObject(url, DepartmentResponse.class);
    }
}