package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateDepartmentWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.UpdateDepartmentWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.DepartmentWorkScheduleResponse;
import com.staffly.work_schedule_service.service.DepartmentWorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/department-work-schedules")
@RequiredArgsConstructor
public class DepartmentWorkScheduleController {

    private final DepartmentWorkScheduleService departmentWorkScheduleService;

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PostMapping
    public DepartmentWorkScheduleResponse create(
            @RequestBody CreateDepartmentWorkScheduleRequest request
    ) {
        return departmentWorkScheduleService.create(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @GetMapping
    public List<DepartmentWorkScheduleResponse> getAll() {
        return departmentWorkScheduleService.getAll();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @GetMapping("/active")
    public List<DepartmentWorkScheduleResponse> getActive() {
        return departmentWorkScheduleService.getActive();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/department/{departmentId}")
    public List<DepartmentWorkScheduleResponse> getByDepartment(
            @PathVariable Long departmentId
    ) {
        return departmentWorkScheduleService.getByDepartment(departmentId);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PutMapping("/{id}")
    public DepartmentWorkScheduleResponse update(
            @PathVariable Long id,
            @RequestBody UpdateDepartmentWorkScheduleRequest request
    ) {
        return departmentWorkScheduleService.update(id, request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable Long id) {
        departmentWorkScheduleService.deactivate(id);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PatchMapping("/{id}/activate")
    public DepartmentWorkScheduleResponse activate(@PathVariable Long id) {
        return departmentWorkScheduleService.activate(id);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        departmentWorkScheduleService.delete(id);
    }
}
