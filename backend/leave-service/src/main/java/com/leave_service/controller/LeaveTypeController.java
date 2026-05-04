package com.leave_service.controller;

import com.leave_service.dto.request.LeaveTypeCreateRequest;
import com.leave_service.dto.response.LeaveTypeResponse;
import com.leave_service.service.LeaveTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-types")
@RequiredArgsConstructor
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    // 🔹 GET ALL (Frontend burayı kullanacak)
    @GetMapping
    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeService.getAllLeaveTypes();
    }

    // 🔹 CREATE (Admin/HR için)
    @PostMapping
    public LeaveTypeResponse createLeaveType(@RequestBody LeaveTypeCreateRequest request) {
        return leaveTypeService.createLeaveType(request);
    }
}