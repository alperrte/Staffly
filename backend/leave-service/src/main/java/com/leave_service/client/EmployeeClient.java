package com.leave_service.client;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmployeeClient {

    private final RestTemplate restTemplate;
    private final HttpServletRequest request;

    @Value("${employee.service.url}")
    private String employeeServiceUrl;

    public Map<String, Object> getEmployeeById(Long id) {

        String token = request.getHeader("Authorization");

        HttpHeaders headers = new HttpHeaders();

        if (token != null && !token.isBlank()) {
            headers.set("Authorization", token);
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                employeeServiceUrl + "/api/v1/employees/" + id,
                HttpMethod.GET,
                entity,
                Map.class
        );

        return response.getBody();
    }
}