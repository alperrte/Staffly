package com.leave_service.service;

import com.leave_service.dto.request.LeaveTypeCreateRequest;
import com.leave_service.dto.response.LeaveTypeResponse;
import com.leave_service.entity.LeaveType;
import com.leave_service.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    // 🔹 GET ALL
    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 🔹 CREATE
    public LeaveTypeResponse createLeaveType(LeaveTypeCreateRequest request) {

        LeaveType leaveType = LeaveType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isHourly(request.getIsHourly())
                .build();

        LeaveType saved = leaveTypeRepository.save(leaveType);

        return mapToResponse(saved);
    }

    // 🔹 MAPPER
    private LeaveTypeResponse mapToResponse(LeaveType leaveType) {
        return LeaveTypeResponse.builder()
                .id(leaveType.getId())
                .name(leaveType.getName())
                .description(leaveType.getDescription())
                .isHourly(leaveType.getIsHourly())
                .build();
    }
}