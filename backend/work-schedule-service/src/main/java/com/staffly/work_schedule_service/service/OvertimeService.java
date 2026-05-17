package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.client.WorkDepartmentClient;
import com.staffly.work_schedule_service.client.WorkEmployeeClient;
import com.staffly.work_schedule_service.dto.request.CreateOvertimeRequest;
import com.staffly.work_schedule_service.dto.request.UpdateOvertimeRequest;
import com.staffly.work_schedule_service.dto.response.OvertimeResponse;
import com.staffly.work_schedule_service.entity.Overtime;
import com.staffly.work_schedule_service.entity.enums.OvertimeStatus;
import com.staffly.work_schedule_service.repository.CompanyHolidayRepository;
import com.staffly.work_schedule_service.repository.OvertimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OvertimeService {

    private final OvertimeRepository overtimeRepository;
    private final CompanyHolidayRepository companyHolidayRepository;

    private final WorkEmployeeClient workEmployeeClient;
    private final WorkDepartmentClient workDepartmentClient;

    public OvertimeResponse createOvertime(CreateOvertimeRequest request) {

        workEmployeeClient.getEmployeeById(request.getEmployeeId());

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        validateOvertimeDateAndTime(
                request.getOvertimeDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        Overtime overtime = Overtime.builder()
                .employeeId(request.getEmployeeId())
                .departmentId(request.getDepartmentId())
                .overtimeDate(request.getOvertimeDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .reason(request.getReason())
                .status(OvertimeStatus.PLANNED)
                .build();

        Overtime savedOvertime = overtimeRepository.save(overtime);

        return toResponse(savedOvertime);
    }

    public List<OvertimeResponse> getEmployeeOvertimes(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return overtimeRepository
                .findByEmployeeIdAndOvertimeDateBetween(employeeId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<OvertimeResponse> getAllOvertimes() {
        return overtimeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<OvertimeResponse> getDepartmentOvertimes(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        workDepartmentClient.getDepartmentById(departmentId);

        return overtimeRepository
                .findByDepartmentIdAndOvertimeDateBetween(departmentId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OvertimeResponse updateOvertime(Long id, UpdateOvertimeRequest request) {

        Overtime overtime = overtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ek mesai kaydı bulunamadı."));

        if (overtime.getStatus() == OvertimeStatus.CANCELLED) {
            throw new RuntimeException("İptal edilmiş ek mesai kaydı güncellenemez.");
        }

        workEmployeeClient.getEmployeeById(request.getEmployeeId());

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        validateOvertimeDateAndTime(
                request.getOvertimeDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        overtime.setEmployeeId(request.getEmployeeId());
        overtime.setDepartmentId(request.getDepartmentId());
        overtime.setOvertimeDate(request.getOvertimeDate());
        overtime.setStartTime(request.getStartTime());
        overtime.setEndTime(request.getEndTime());
        overtime.setReason(request.getReason());
        overtime.setStatus(OvertimeStatus.UPDATED);

        Overtime updated = overtimeRepository.save(overtime);

        return toResponse(updated);
    }

    public OvertimeResponse cancelOvertime(Long id) {

        Overtime overtime = overtimeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ek mesai kaydı bulunamadı."));

        overtime.setStatus(OvertimeStatus.CANCELLED);

        Overtime updated = overtimeRepository.save(overtime);

        return toResponse(updated);
    }

    private void validateOvertimeDateAndTime(
            LocalDate overtimeDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime
    ) {
        if (companyHolidayRepository.existsByHolidayDate(overtimeDate)) {
            throw new RuntimeException("Şirket tatilinde ek mesai atanamaz.");
        }

        if (!endTime.isAfter(startTime)) {
            throw new RuntimeException("Ek mesai bitiş saati başlangıç saatinden sonra olmalıdır.");
        }
    }

    private OvertimeResponse toResponse(Overtime overtime) {
        return OvertimeResponse.builder()
                .id(overtime.getId())
                .employeeId(overtime.getEmployeeId())
                .departmentId(overtime.getDepartmentId())
                .overtimeDate(overtime.getOvertimeDate())
                .startTime(overtime.getStartTime())
                .endTime(overtime.getEndTime())
                .reason(overtime.getReason())
                .status(overtime.getStatus())
                .build();
    }
}
