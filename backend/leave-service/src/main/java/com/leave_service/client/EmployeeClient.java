package com.leave_service.client;

import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmployeeClient {

    private final RestTemplate restTemplate;
    private final HttpServletRequest request;

    public Map<String, Object> getEmployeeById(Long id) {

        String token = request.getHeader("Authorization");

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "http://employee-service:8082/api/v1/employees/" + id,
                HttpMethod.GET,
                entity,
                Map.class
        );

        return response.getBody();
    }
}