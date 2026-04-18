package com.staffly.cv_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class DepartmentClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${department.service.url}")
    private String baseUrl;

    public Map<String, Object> getDepartment(Long id) {
        return restTemplate.getForObject(baseUrl + "/departments/" + id, Map.class);
    }

    public Map<String, Object> getSubDepartment(Long id) {
        return restTemplate.getForObject(baseUrl + "/departments/sub-departments/" + id, Map.class);
    }

    public Map<String, Object> getPosition(Long id) {
        return restTemplate.getForObject(baseUrl + "/departments/positions/" + id, Map.class);
    }
}