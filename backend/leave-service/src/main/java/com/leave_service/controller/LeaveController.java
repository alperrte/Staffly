package com.leave_service.controller;

import com.leave_service.dto.request.LeaveApprovalRequest;
import com.leave_service.dto.request.LeaveBalanceUpsertRequest;
import com.leave_service.dto.request.LeaveRequestCreateRequest;
import com.leave_service.dto.response.LeaveBalanceResponse;
import com.leave_service.dto.response.LeaveResponse;
import com.leave_service.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'MANAGER', 'EMPLOYEE')")
    @PostMapping
    public LeaveResponse createLeave(@RequestBody LeaveRequestCreateRequest request) {
        return leaveService.createLeave(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/employee/{employeeId}")
    public List<LeaveResponse> getEmployeeLeaves(@PathVariable Long employeeId) {
        return leaveService.getEmployeeLeaves(employeeId);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @GetMapping
    public List<LeaveResponse> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'MANAGER', 'EMPLOYEE')")
    @GetMapping("/employee/{employeeId}/annual-balance")
    public LeaveBalanceResponse getAnnualLeaveBalance(@PathVariable Long employeeId) {
        return leaveService.getAnnualLeaveBalance(employeeId);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PutMapping("/employee/{employeeId}/annual-quota")
    public LeaveBalanceResponse updateAnnualLeaveQuota(
            @PathVariable Long employeeId,
            @RequestBody LeaveBalanceUpsertRequest request
    ) {
        return leaveService.updateAnnualLeaveQuota(employeeId, request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @PostMapping("/approve")
    public void approveLeave(@RequestBody LeaveApprovalRequest request) {
        leaveService.approveLeave(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER')")
    @GetMapping("/test/{id}")
    public String test(@PathVariable Long id) {
        leaveService.testEmployee(id);
        return "OK";
    }
}
