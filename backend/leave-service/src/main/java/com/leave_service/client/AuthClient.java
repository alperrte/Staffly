package com.leave_service.client;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final RestTemplate restTemplate;
    private final HttpServletRequest request;

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;

    public List<Map<String, Object>> getUsers() {
        String token = request.getHeader("Authorization");

        HttpHeaders headers = new HttpHeaders();

        if (token != null && !token.isBlank()) {
            headers.set("Authorization", token);
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<List> response = restTemplate.exchange(
                authServiceUrl + "/users",
                HttpMethod.GET,
                entity,
                List.class
        );

        return response.getBody();
    }
}
