package com.taskservice.task.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.taskservice.task.dto.response.CurrentUserResponse;

@Component
public class AuthClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${auth.service.url}")
    private String baseUrl;

    public CurrentUserResponse getCurrentUser(String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        return restTemplate.exchange(
                baseUrl + "/users/me",
                HttpMethod.GET,
                entity,
                CurrentUserResponse.class
        ).getBody();
    }
}