package com.leave_service.repository;

import com.leave_service.entity.LeaveApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeaveApprovalRepository extends JpaRepository<LeaveApproval, Long> {

    List<LeaveApproval> findByLeaveRequest_Id(Long leaveRequestId);

    Optional<LeaveApproval> findFirstByLeaveRequest_IdAndActionOrderByCreatedAtDesc(Long leaveRequestId, String action);
}
