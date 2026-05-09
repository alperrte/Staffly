package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateBulkOvertimeRequest;
import com.staffly.work_schedule_service.dto.request.CreateOvertimeRequest;
import com.staffly.work_schedule_service.dto.request.UpdateOvertimeRequest;
import com.staffly.work_schedule_service.dto.response.OvertimeResponse;
import com.staffly.work_schedule_service.service.OvertimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/overtimes")
@RequiredArgsConstructor
public class OvertimeController {

    private final OvertimeService overtimeService;

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PostMapping
    public OvertimeResponse createOvertime(
            @RequestBody CreateOvertimeRequest request
    ) {
        return overtimeService.createOvertime(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PostMapping("/bulk")
    public List<OvertimeResponse> createBulkOvertime(
            @RequestBody CreateBulkOvertimeRequest request
    ) {
        return overtimeService.createBulkOvertime(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/employee/{employeeId}")
    public List<OvertimeResponse> getEmployeeOvertimes(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return overtimeService.getEmployeeOvertimes(employeeId, startDate, endDate);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @GetMapping("/department/{departmentId}")
    public List<OvertimeResponse> getDepartmentOvertimes(
            @PathVariable Long departmentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return overtimeService.getDepartmentOvertimes(departmentId, startDate, endDate);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PutMapping("/{id}")
    public OvertimeResponse updateOvertime(
            @PathVariable Long id,
            @RequestBody UpdateOvertimeRequest request
    ) {
        return overtimeService.updateOvertime(id, request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PatchMapping("/{id}/cancel")
    public OvertimeResponse cancelOvertime(@PathVariable Long id) {
        return overtimeService.cancelOvertime(id);
    }
}