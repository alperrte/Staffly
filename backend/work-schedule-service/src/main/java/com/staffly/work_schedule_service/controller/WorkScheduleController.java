package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateBulkWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.CreateWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.WorkScheduleResponse;
import com.staffly.work_schedule_service.service.WorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    @PostMapping
    public WorkScheduleResponse createWorkSchedule(
            @RequestBody CreateWorkScheduleRequest request
    ) {
        return workScheduleService.createWorkSchedule(request);
    }

    @PostMapping("/bulk")
    public List<WorkScheduleResponse> createBulkWorkSchedule(
            @RequestBody CreateBulkWorkScheduleRequest request
    ) {
        return workScheduleService.createBulkWorkSchedule(request);
    }

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

    @GetMapping("/daily")
    public WorkScheduleResponse getDailySchedule(
            @RequestParam Long employeeId,
            @RequestParam LocalDate workDate
    ) {
        return workScheduleService.getDailySchedule(employeeId, workDate);
    }

    @PatchMapping("/{id}/cancel")
    public WorkScheduleResponse cancelWorkSchedule(@PathVariable Long id) {
        return workScheduleService.cancelWorkSchedule(id);
    }
}