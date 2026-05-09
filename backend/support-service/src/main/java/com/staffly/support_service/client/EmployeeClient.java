package com.staffly.support_service.client;

import com.staffly.support_service.security.JwtService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmployeeClient {

        @Value("${auth.service.url}")
        private String authServiceUrl;

        private final JwtService jwtService;

    private final RestTemplate restTemplate = new RestTemplate();

    private HttpEntity<Void> authorizedEntity(String authHeader) {

        HttpHeaders headers = new HttpHeaders();

        headers.set(
                HttpHeaders.AUTHORIZATION,
                authHeader
        );

        return new HttpEntity<>(headers);
    }

    public Long getEmployeeIdByEmail(String authHeader) {

        try {

            String url =
                    authServiceUrl +
                            "/users/me";

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            authorizedEntity(authHeader),
                            Map.class
                    );

            Map<String, Object> body =
                    response.getBody();

            if (body != null && body.get("employeeId") != null) {
                return Long.valueOf(
                        body.get("employeeId").toString()
                );
            }

            String token = authHeader.startsWith("Bearer ")
                    ? authHeader.substring(7)
                    : authHeader;

            Long fallbackUserId = jwtService.extractUserId(token);

            if (fallbackUserId != null) {
                return fallbackUserId;
            }

            throw new RuntimeException("Employee not found in auth service");

        } catch (RestClientException e) {
            throw new RuntimeException(
                    "Auth service error: " + e.getMessage()
            );
        }
    }
}