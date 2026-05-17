package com.auth_service.auth.client;

import com.auth_service.auth.dto.response.EmployeeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
public class EmployeeClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${employee.service.url}")
    private String employeeServiceUrl;

    private String employeesApiBaseUrl() {
        String normalizedBase = employeeServiceUrl != null
                ? employeeServiceUrl.replaceAll("/+$", "")
                : "";

        if (normalizedBase.endsWith("/api/v1")) {
            return normalizedBase + "/employees";
        }

        return normalizedBase + "/api/v1/employees";
    }

    public List<EmployeeResponse> getEmployees(String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authHeader);

        return restTemplate.exchange(
                employeesApiBaseUrl(),
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<List<EmployeeResponse>>() {}
        ).getBody();
    }

    public EmployeeResponse getEmployeeById(String authHeader, Long employeeId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authHeader);

        return restTemplate.exchange(
                employeesApiBaseUrl() + "/" + employeeId,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                EmployeeResponse.class
        ).getBody();
    }
}
