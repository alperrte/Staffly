package com.taskservice.task.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class EmployeeClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${employee.service.url}")
    private String baseUrl;

    // 🔥 Employee var mı kontrol
    public boolean isEmployeeExists(Long employeeId) {
        try {
            restTemplate.getForObject(
                    baseUrl + "/employees/" + employeeId,
                    Map.class
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 🔥 Employee adı çek (UI için)
    public String getEmployeeName(Long employeeId) {
        try {
            Map<String, Object> employee =
                    restTemplate.getForObject(
                            baseUrl + "/employees/" + employeeId,
                            Map.class
                    );

            if (employee == null) return null;

            return employee.get("firstName") + " " + employee.get("lastName");

        } catch (Exception e) {
            return null;
        }
    }
}