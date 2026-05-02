package com.leave_service.controller;

import com.leave_service.dto.request.LeaveApprovalRequest;
import com.leave_service.dto.request.LeaveRequestCreateRequest;
import com.leave_service.dto.response.LeaveResponse;
import com.leave_service.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    // 🔥 1️⃣ İZİN OLUŞTUR
    @PostMapping
    public LeaveResponse createLeave(@RequestBody LeaveRequestCreateRequest request) {
        return leaveService.createLeave(request);
    }

    // 🔥 2️⃣ ÇALIŞANIN İZİNLERİ
    @GetMapping("/{employeeId}")
    public List<LeaveResponse> getEmployeeLeaves(@PathVariable Long employeeId) {
        return leaveService.getEmployeeLeaves(employeeId);
    }

    // 🔥 3️⃣ ONAY / RED
    @PostMapping("/approve")
    public void approveLeave(@RequestBody LeaveApprovalRequest request) {
        leaveService.approveLeave(request);
    }

    @GetMapping("/test/{id}")
    public String test(@PathVariable Long id) {
        leaveService.testEmployee(id);
        return "OK";
    }
}