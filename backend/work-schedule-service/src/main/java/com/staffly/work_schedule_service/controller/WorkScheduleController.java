package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateBulkWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.CreateWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.UpdateWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.WorkScheduleResponse;
import com.staffly.work_schedule_service.service.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PostMapping
    public WorkScheduleResponse createWorkSchedule(
            @RequestBody CreateWorkScheduleRequest request
    ) {
        return workScheduleService.createWorkSchedule(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PostMapping("/bulk")
    public List<WorkScheduleResponse> createBulkWorkSchedule(
            @RequestBody CreateBulkWorkScheduleRequest request
    ) {
        return workScheduleService.createBulkWorkSchedule(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/employee/{employeeId}")
    public List<WorkScheduleResponse> getEmployeeWeeklySchedule(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return workScheduleService.getEmployeeWeeklySchedule(
                employeeId,
                startDate,
                endDate
        );
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/employee/{employeeId}/monthly")
    public List<WorkScheduleResponse> getEmployeeMonthlySchedule(
            @PathVariable Long employeeId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return workScheduleService.getEmployeeMonthlySchedule(
                employeeId,
                startDate,
                endDate
        );
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @GetMapping("/department/{departmentId}")
    public List<WorkScheduleResponse> getDepartmentSchedule(
            @PathVariable Long departmentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return workScheduleService.getDepartmentSchedule(
                departmentId,
                startDate,
                endDate
        );
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/daily")
    public WorkScheduleResponse getDailySchedule(
            @RequestParam Long employeeId,
            @RequestParam LocalDate workDate
    ) {
        return workScheduleService.getDailySchedule(employeeId, workDate);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PatchMapping("/{id}/cancel")
    public WorkScheduleResponse cancelWorkSchedule(@PathVariable Long id) {
        return workScheduleService.cancelWorkSchedule(id);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PutMapping("/{id}")
    public WorkScheduleResponse updateWorkSchedule(
            @PathVariable Long id,
            @RequestBody UpdateWorkScheduleRequest request
    ) {
        return workScheduleService.updateWorkSchedule(id, request);
    }
}