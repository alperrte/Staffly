package com.leave_service.service;

import com.leave_service.dto.request.LeaveApprovalRequest;
import com.leave_service.dto.request.LeaveBalanceUpsertRequest;
import com.leave_service.dto.request.LeaveRequestCreateRequest;
import com.leave_service.dto.response.LeaveBalanceResponse;
import com.leave_service.dto.response.LeaveResponse;
import com.leave_service.client.AuthClient;
import com.leave_service.entity.LeaveApproval;
import com.leave_service.entity.LeaveBalance;
import com.leave_service.entity.LeaveRequest;
import com.leave_service.entity.LeaveType;
import com.leave_service.repository.LeaveApprovalRepository;
import com.leave_service.repository.LeaveBalanceRepository;
import com.leave_service.repository.LeaveRequestRepository;
import com.leave_service.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.leave_service.client.EmployeeClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveApprovalRepository leaveApprovalRepository;
    private final EmployeeClient employeeClient;
    private final AuthClient authClient;



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

    public List<LeaveResponse> getAllLeaves() {

        return leaveRequestRepository.findAll()
                .stream()
                .filter(entity -> canManageEmployee(entity.getEmployeeId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LeaveBalanceResponse getAnnualLeaveBalance(Long employeeId) {
        LeaveType annualLeaveType = getAnnualLeaveType();
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveType_Id(employeeId, annualLeaveType.getId())
                .orElse(null);

        return LeaveBalanceResponse.builder()
                .employeeId(employeeId)
                .leaveTypeId(annualLeaveType.getId())
                .leaveTypeName(annualLeaveType.getName())
                .quotaDays(balance != null ? balance.getRemainingDays() : null)
                .remainingDays(balance != null ? balance.getRemainingDays() : null)
                .remainingHours(balance != null ? balance.getRemainingHours() : 0)
                .build();
    }

    public LeaveBalanceResponse updateAnnualLeaveQuota(Long employeeId, LeaveBalanceUpsertRequest request) {
        assertCanManageEmployee(employeeId);

        LeaveType annualLeaveType = getAnnualLeaveType();
        Integer quotaDays = request.getQuotaDays() == null ? 0 : Math.max(request.getQuotaDays(), 0);

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployeeIdAndLeaveType_Id(employeeId, annualLeaveType.getId())
                .orElseGet(() -> LeaveBalance.builder()
                        .employeeId(employeeId)
                        .leaveType(annualLeaveType)
                        .remainingHours(0)
                        .build());

        balance.setRemainingDays(quotaDays);
        LeaveBalance saved = leaveBalanceRepository.save(balance);

        return LeaveBalanceResponse.builder()
                .employeeId(saved.getEmployeeId())
                .leaveTypeId(saved.getLeaveType().getId())
                .leaveTypeName(saved.getLeaveType().getName())
                .quotaDays(saved.getRemainingDays())
                .remainingDays(saved.getRemainingDays())
                .remainingHours(saved.getRemainingHours())
                .build();
    }

    // 🔥 3️⃣ ONAY / RED
    public void approveLeave(LeaveApprovalRequest request) {

        LeaveRequest leaveRequest = leaveRequestRepository.findById(request.getLeaveRequestId())
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        assertCanManageEmployee(leaveRequest.getEmployeeId());

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
        Map<String, Object> employee = null;

        try {
            employee = employeeClient.getEmployeeById(entity.getEmployeeId());
        } catch (Exception ignored) {
            employee = null;
        }

        String firstName = employee != null && employee.get("firstName") != null ? String.valueOf(employee.get("firstName")) : null;
        String lastName = employee != null && employee.get("lastName") != null ? String.valueOf(employee.get("lastName")) : null;
        String fullName = ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();

        return LeaveResponse.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .leaveTypeName(entity.getLeaveType().getName())
                .startDatetime(entity.getStartDatetime())
                .endDatetime(entity.getEndDatetime())
                .totalDays(entity.getTotalDays())
                .totalHours(entity.getTotalHours())
                .status(entity.getStatus())
                .reason(entity.getReason())
                .employeeFirstName(firstName)
                .employeeLastName(lastName)
                .employeeFullName(fullName.isBlank() ? null : fullName)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private LeaveType getAnnualLeaveType() {
        return leaveTypeRepository.findAll()
                .stream()
                .filter(type -> type.getName() != null && type.getName().toUpperCase().contains("YILLIK"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Annual leave type not found"));
    }

    private void assertCanManageEmployee(Long employeeId) {
        if (!canManageEmployee(employeeId)) {
            throw new AccessDeniedException("You are not allowed to manage this employee's leave requests");
        }
    }

    private boolean canManageEmployee(Long employeeId) {
        List<String> currentRoles = getCurrentRoles();
        String targetEmail = getEmployeeEmail(employeeId);
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication != null ? authentication.getName() : null;

        if (currentRoles.contains("ROLE_SYSTEM_ADMIN")) {
            return true;
        }

        if (targetEmail != null && currentEmail != null && targetEmail.equalsIgnoreCase(currentEmail)) {
            return false;
        }

        String targetRoleGroup = getEmployeeRoleGroup(targetEmail);

        if (currentRoles.contains("ROLE_HR_MANAGER")) {
            return !"HR".equals(targetRoleGroup);
        }

        if (currentRoles.contains("ROLE_DEPARTMENT_MANAGER")) {
            return !"DEPARTMENT_MANAGER".equals(targetRoleGroup);
        }

        return false;
    }

    private List<String> getCurrentRoles() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            return Collections.emptyList();
        }

        return authentication.getAuthorities()
                .stream()
                .map(authority -> normalizeRole(authority.getAuthority()))
                .toList();
    }

    private String getEmployeeEmail(Long employeeId) {
        try {
            Map<String, Object> employee = employeeClient.getEmployeeById(employeeId);
            Object email = employee != null ? employee.get("email") : null;

            return email != null ? String.valueOf(email) : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String getEmployeeRoleGroup(String email) {
        try {
            if (email == null) {
                return "OTHER";
            }

            List<Map<String, Object>> users = authClient.getUsers();

            if (users == null) {
                return "OTHER";
            }

            return users.stream()
                    .filter(user -> Objects.equals(
                            String.valueOf(user.get("email")).toLowerCase(),
                            email.toLowerCase()
                    ))
                    .findFirst()
                    .map(this::resolveUserRoleGroup)
                    .orElse("OTHER");
        } catch (Exception ignored) {
            return "OTHER";
        }
    }

    private String resolveUserRoleGroup(Map<String, Object> user) {
        Object rolesObject = user.get("roles");

        if (!(rolesObject instanceof List<?> roles)) {
            return "OTHER";
        }

        List<String> roleNames = roles.stream()
                .map(this::extractRoleName)
                .map(this::normalizeRole)
                .toList();

        if (roleNames.contains("ROLE_HR_MANAGER")) {
            return "HR";
        }

        if (roleNames.contains("ROLE_DEPARTMENT_MANAGER")) {
            return "DEPARTMENT_MANAGER";
        }

        return "OTHER";
    }

    private String extractRoleName(Object role) {
        if (role instanceof Map<?, ?> roleMap && roleMap.get("name") != null) {
            return String.valueOf(roleMap.get("name"));
        }

        return String.valueOf(role);
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "";
        }

        return role.startsWith("ROLE_") ? role : "ROLE_" + role;
    }
}
