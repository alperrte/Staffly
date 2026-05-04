package com.leave_service.service;

import com.leave_service.dto.request.LeaveApprovalRequest;
import com.leave_service.dto.request.LeaveRequestCreateRequest;
import com.leave_service.dto.response.LeaveResponse;
import com.leave_service.entity.LeaveApproval;
import com.leave_service.entity.LeaveRequest;
import com.leave_service.entity.LeaveType;
import com.leave_service.repository.LeaveApprovalRepository;
import com.leave_service.repository.LeaveBalanceRepository;
import com.leave_service.repository.LeaveRequestRepository;
import com.leave_service.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.leave_service.client.EmployeeClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveApprovalRepository leaveApprovalRepository;
    private final EmployeeClient employeeClient;



    // 🔥 1️⃣ İZİN OLUŞTUR
    public LeaveResponse createLeave(LeaveRequestCreateRequest request) {


        // 🔽 BURASI ZATEN VARDI
        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave type not found"));

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employeeId(request.getEmployeeId())
                .leaveType(leaveType)
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .status("PENDING")
                .reason(request.getReason())
                .build();

        leaveRequestRepository.save(leaveRequest);

        return mapToResponse(leaveRequest);
    }

    // 🔥 2️⃣ İZİNLERİ LİSTELE
    public List<LeaveResponse> getEmployeeLeaves(Long employeeId) {

        return leaveRequestRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 🔥 3️⃣ ONAY / RED
    public void approveLeave(LeaveApprovalRequest request) {

        LeaveRequest leaveRequest = leaveRequestRepository.findById(request.getLeaveRequestId())
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        leaveRequest.setStatus(request.getAction());
        leaveRequestRepository.save(leaveRequest);

        LeaveApproval approval = LeaveApproval.builder()
                .leaveRequest(leaveRequest)
                .managerId(request.getManagerId())
                .action(request.getAction())
                .comment(request.getComment())
                .build();

        leaveApprovalRepository.save(approval);
    }

    public void testEmployee(Long id) {
        var employee = employeeClient.getEmployeeById(id);
        System.out.println("EMPLOYEE DATA: " + employee);
    }

    // 🔥 4️⃣ ENTITY → DTO
    private LeaveResponse mapToResponse(LeaveRequest entity) {

        return LeaveResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .leaveTypeName(entity.getLeaveType().getName())
                .startDatetime(entity.getStartDatetime())
                .endDatetime(entity.getEndDatetime())
                .totalDays(entity.getTotalDays())
                .totalHours(entity.getTotalHours())
                .status(entity.getStatus())
                .build();
    }
}
