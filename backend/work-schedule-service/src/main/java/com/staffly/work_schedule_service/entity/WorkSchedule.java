package com.staffly.work_schedule_service.entity;

import com.staffly.work_schedule_service.entity.enums.WorkModel;
import com.staffly.work_schedule_service.entity.enums.WorkScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "work_schedules",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UQ_employee_date",
                        columnNames = {"employee_id", "work_date"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "department_id")
    private Long departmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_model", nullable = false, length = 30)
    private WorkModel workModel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkScheduleStatus status;

    @Column(length = 500)
    private String note;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = WorkScheduleStatus.PLANNED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}