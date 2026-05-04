package com.leave_service.repository;

import com.leave_service.entity.LeaveApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveApprovalRepository extends JpaRepository<LeaveApproval, Long> {

    List<LeaveApproval> findByLeaveRequest_Id(Long leaveRequestId);
}