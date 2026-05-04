package com.taskservice.task.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.taskservice.task.dto.response.EmployeeLookupResponse;

@Component
public class EmployeeClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${employee.service.url}")
    private String baseUrl;

    private String employeesApiBaseUrl() {
        String normalizedBase = baseUrl != null ? baseUrl.replaceAll("/+$", "") : "";

        if (normalizedBase.endsWith("/api/v1")) {
            return normalizedBase + "/employees";
        }

        return normalizedBase + "/api/v1/employees";
    }

    private HttpEntity<Void> authorizedEntity(String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authHeader);
        return new HttpEntity<>(headers);
    }

    // 🔥 Employee var mı kontrol
    public boolean isEmployeeExists(String authHeader, Long employeeId) {
        try {
            ResponseEntity<EmployeeLookupResponse> response = restTemplate.exchange(
                    employeesApiBaseUrl() + "/" + employeeId,
                    HttpMethod.GET,
                    authorizedEntity(authHeader),
                    EmployeeLookupResponse.class
            );

            return response.getBody() != null;
        } catch (RestClientException e) {
            return false;
        }
    }

    // 🔥 Employee adı çek (UI için)
        public String getEmployeeName(String authHeader, Long employeeId) {
        try {
            ResponseEntity<EmployeeLookupResponse> response = restTemplate.exchange(
                    employeesApiBaseUrl() + "/" + employeeId,
                HttpMethod.GET,
                authorizedEntity(authHeader),
                    EmployeeLookupResponse.class
            );

            EmployeeLookupResponse employee = response.getBody();

            if (employee == null) return null;

            return employee.getFirstName() + " " + employee.getLastName();

        } catch (RestClientException e) {
            return null;
        }
    }

    public EmployeeLookupResponse getEmployeeById(String authHeader, Long employeeId) {
        try {
            return restTemplate.exchange(
                    employeesApiBaseUrl() + "/" + employeeId,
                    HttpMethod.GET,
                    authorizedEntity(authHeader),
                    EmployeeLookupResponse.class
            ).getBody();
        } catch (RestClientException e) {
            return null;
        }
    }

    public EmployeeLookupResponse getEmployeeByEmail(String authHeader, String email) {
        try {
            return restTemplate.exchange(
                    employeesApiBaseUrl() + "/by-email/" + email,
                    HttpMethod.GET,
                    authorizedEntity(authHeader),
                    EmployeeLookupResponse.class
            ).getBody();
        } catch (RestClientException e) {
            return null;
        }
    }
}