package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateDepartmentWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.UpdateDepartmentWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.DepartmentWorkScheduleResponse;
import com.staffly.work_schedule_service.service.DepartmentWorkScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/department-work-schedules")
@RequiredArgsConstructor
public class DepartmentWorkScheduleController {

    private final DepartmentWorkScheduleService departmentWorkScheduleService;

    @PostMapping
    public DepartmentWorkScheduleResponse create(
            @RequestBody CreateDepartmentWorkScheduleRequest request
    ) {
        return departmentWorkScheduleService.create(request);
    }

    @GetMapping
    public List<DepartmentWorkScheduleResponse> getAll() {
        return departmentWorkScheduleService.getAll();
    }

    @GetMapping("/active")
    public List<DepartmentWorkScheduleResponse> getActive() {
        return departmentWorkScheduleService.getActive();
    }

    @GetMapping("/department/{departmentId}")
    public List<DepartmentWorkScheduleResponse> getByDepartment(
            @PathVariable Long departmentId
    ) {
        return departmentWorkScheduleService.getByDepartment(departmentId);
    }

    @PutMapping("/{id}")
    public DepartmentWorkScheduleResponse update(
            @PathVariable Long id,
            @RequestBody UpdateDepartmentWorkScheduleRequest request
    ) {
        return departmentWorkScheduleService.update(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public void deactivate(@PathVariable Long id) {
        departmentWorkScheduleService.deactivate(id);
    }

    @PatchMapping("/{id}/activate")
    public DepartmentWorkScheduleResponse activate(@PathVariable Long id) {
        return departmentWorkScheduleService.activate(id);
    }
}