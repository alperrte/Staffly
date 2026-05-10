package com.employee_service.employee.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class EmployeeDepartmentClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${department.service.url}")
    private String baseUrl;

    public List<Map<String, Object>> getAllDepartments() {
        ResponseEntity<List> response =
                restTemplate.getForEntity(baseUrl + "/departments", List.class);
        return response.getBody();
    }

    public Map<String, Object> getDepartmentById(Long departmentId) {
        return restTemplate.getForObject(baseUrl + "/departments/" + departmentId, Map.class);
    }

    public Map<String, Object> getSubDepartmentById(Long subDepartmentId) {
        return restTemplate.getForObject(baseUrl + "/departments/sub-departments/" + subDepartmentId, Map.class);
    }

    public Map<String, Object> getPositionById(Long positionId) {
        return restTemplate.getForObject(baseUrl + "/departments/positions/" + positionId, Map.class);
    }

    public List<Map<String, Object>> getSubDepartments(Long departmentId) {
        ResponseEntity<List> response =
                restTemplate.getForEntity(
                        baseUrl + "/departments/" + departmentId + "/sub-departments",
                        List.class
                );
        return response.getBody();
    }

    public List<Map<String, Object>> getPositions(Long subDepartmentId) {
        ResponseEntity<List> response =
                restTemplate.getForEntity(
                        baseUrl + "/departments/sub-departments/" + subDepartmentId + "/positions",
                        List.class
                );
        return response.getBody();
    }

    public boolean isDepartmentExists(Long id) {
        try {
            restTemplate.getForObject(baseUrl + "/departments/" + id, Map.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isPositionUnderDepartment(Long departmentId, Long positionId) {
        try {
            List<Map<String, Object>> subDepartments = getSubDepartments(departmentId);

            if (subDepartments == null) return false;

            for (Map<String, Object> subDepartment : subDepartments) {
                Object subDepartmentIdObj = subDepartment.get("id");
                if (subDepartmentIdObj == null) continue;

                Long subDepartmentId = ((Number) subDepartmentIdObj).longValue();
                List<Map<String, Object>> positions = getPositions(subDepartmentId);

                if (positions == null) continue;

                for (Map<String, Object> position : positions) {
                    Object positionIdObj = position.get("id");
                    if (positionIdObj != null && ((Number) positionIdObj).longValue() == positionId) {
                        return true;
                    }
                }
            }

            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public String getDepartmentName(Long departmentId) {
        try {
            Map<String, Object> department = getDepartmentById(departmentId);
            return department != null ? String.valueOf(department.get("name")) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public String getSubDepartmentName(Long subDepartmentId) {
        try {
            Map<String, Object> subDepartment = getSubDepartmentById(subDepartmentId);
            return subDepartment != null ? String.valueOf(subDepartment.get("name")) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public String getPositionNameByDepartment(Long departmentId, Long positionId) {
        try {
            List<Map<String, Object>> subDepartments = getSubDepartments(departmentId);
            if (subDepartments == null) return null;

            for (Map<String, Object> subDepartment : subDepartments) {
                Object subDepartmentIdObj = subDepartment.get("id");
                if (subDepartmentIdObj == null) continue;

                Long subDepartmentId = ((Number) subDepartmentIdObj).longValue();
                List<Map<String, Object>> positions = getPositions(subDepartmentId);
                if (positions == null) continue;

                for (Map<String, Object> position : positions) {
                    Object positionIdObj = position.get("id");
                    if (positionIdObj != null && ((Number) positionIdObj).longValue() == positionId) {
                        return String.valueOf(position.get("name"));
                    }
                }
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }
}