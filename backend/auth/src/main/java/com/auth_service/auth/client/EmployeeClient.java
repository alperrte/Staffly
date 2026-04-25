package com.auth_service.auth.client;

import com.auth_service.auth.dto.response.EmployeeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class EmployeeClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${employee.service.url}")
    private String employeeServiceUrl;

    public List<EmployeeResponse> getEmployees() {
        return restTemplate.exchange(
                employeeServiceUrl + "/employees",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<EmployeeResponse>>() {}
        ).getBody();
    }
}