package com.leave_service.repository;

import com.leave_service.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployeeIdAndLeaveType_Id(Long employeeId, Long leaveTypeId);
}