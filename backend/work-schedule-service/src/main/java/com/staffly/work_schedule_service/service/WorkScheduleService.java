package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.client.WorkDepartmentClient;
import com.staffly.work_schedule_service.client.WorkEmployeeClient;
import com.staffly.work_schedule_service.client.response.EmployeeResponse;
import com.staffly.work_schedule_service.dto.request.CreateBulkWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.CreateWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.ShiftResponse;
import com.staffly.work_schedule_service.dto.response.WorkScheduleResponse;
import com.staffly.work_schedule_service.entity.Shift;
import com.staffly.work_schedule_service.entity.WorkSchedule;
import com.staffly.work_schedule_service.entity.enums.WorkScheduleStatus;
import com.staffly.work_schedule_service.repository.CompanyHolidayRepository;
import com.staffly.work_schedule_service.repository.ShiftRepository;
import com.staffly.work_schedule_service.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final ShiftRepository shiftRepository;
    private final CompanyHolidayRepository companyHolidayRepository;

    private final WorkEmployeeClient workEmployeeClient;
    private final WorkDepartmentClient workDepartmentClient;

    public WorkScheduleResponse createWorkSchedule(CreateWorkScheduleRequest request) {

        workEmployeeClient.getEmployeeById(request.getEmployeeId());

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        if (companyHolidayRepository.existsByHolidayDate(request.getWorkDate())) {
            throw new RuntimeException("Bu tarih şirket tatili olduğu için mesai atanamaz.");
        }

        if (workScheduleRepository.existsByEmployeeIdAndWorkDate(
                request.getEmployeeId(),
                request.getWorkDate()
        )) {
            throw new RuntimeException("Bu çalışana bu tarih için zaten mesai atanmış.");
        }

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new RuntimeException("Mesai şablonu bulunamadı."));

        if (!shift.getActive()) {
            throw new RuntimeException("Pasif mesai şablonu atanamaz.");
        }

        WorkSchedule workSchedule = WorkSchedule.builder()
                .employeeId(request.getEmployeeId())
                .departmentId(request.getDepartmentId())
                .shift(shift)
                .workDate(request.getWorkDate())
                .workModel(request.getWorkModel())
                .status(WorkScheduleStatus.PLANNED)
                .note(request.getNote())
                .build();

        WorkSchedule savedSchedule = workScheduleRepository.save(workSchedule);

        return toResponse(savedSchedule);
    }

    public List<WorkScheduleResponse> createBulkWorkSchedule(CreateBulkWorkScheduleRequest request) {

        workDepartmentClient.getDepartmentById(request.getDepartmentId());

        Shift shift = shiftRepository.findById(request.getShiftId())
                .orElseThrow(() -> new RuntimeException("Mesai şablonu bulunamadı."));

        if (!shift.getActive()) {
            throw new RuntimeException("Pasif mesai şablonu atanamaz.");
        }

        List<EmployeeResponse> employees =
                workEmployeeClient.getEmployeesByDepartmentId(request.getDepartmentId());

        List<WorkScheduleResponse> responses = new ArrayList<>();

        LocalDate currentDate = request.getStartDate();

        while (!currentDate.isAfter(request.getEndDate())) {

            boolean holiday = companyHolidayRepository.existsByHolidayDate(currentDate);

            if (!holiday) {
                for (EmployeeResponse employee : employees) {

                    boolean exists = workScheduleRepository.existsByEmployeeIdAndWorkDate(
                            employee.getId(),
                            currentDate
                    );

                    if (!exists) {
                        WorkSchedule workSchedule = WorkSchedule.builder()
                                .employeeId(employee.getId())
                                .departmentId(request.getDepartmentId())
                                .shift(shift)
                                .workDate(currentDate)
                                .workModel(request.getWorkModel())
                                .status(WorkScheduleStatus.PLANNED)
                                .build();

                        WorkSchedule saved = workScheduleRepository.save(workSchedule);
                        responses.add(toResponse(saved));
                    }
                }
            }

            currentDate = currentDate.plusDays(1);
        }

        return responses;
    }

    public List<WorkScheduleResponse> getEmployeeWeeklySchedule(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        workEmployeeClient.getEmployeeById(employeeId);

        return workScheduleRepository
                .findByEmployeeIdAndWorkDateBetween(employeeId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<WorkScheduleResponse> getEmployeeMonthlySchedule(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        workEmployeeClient.getEmployeeById(employeeId);

        return workScheduleRepository
                .findByEmployeeIdAndWorkDateBetween(employeeId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<WorkScheduleResponse> getDepartmentSchedule(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        workDepartmentClient.getDepartmentById(departmentId);

        return workScheduleRepository
                .findByDepartmentIdAndWorkDateBetween(departmentId, startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public WorkScheduleResponse getDailySchedule(Long employeeId, LocalDate workDate) {
        workEmployeeClient.getEmployeeById(employeeId);

        WorkSchedule workSchedule = workScheduleRepository
                .findByEmployeeIdAndWorkDate(employeeId, workDate)
                .orElseThrow(() -> new RuntimeException("Bu tarihe ait mesai planı bulunamadı."));

        return toResponse(workSchedule);
    }

    public WorkScheduleResponse cancelWorkSchedule(Long id) {
        WorkSchedule workSchedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesai planı bulunamadı."));

        workSchedule.setStatus(WorkScheduleStatus.CANCELLED);

        WorkSchedule updated = workScheduleRepository.save(workSchedule);

        return toResponse(updated);
    }

    private WorkScheduleResponse toResponse(WorkSchedule workSchedule) {
        return WorkScheduleResponse.builder()
                .id(workSchedule.getId())
                .employeeId(workSchedule.getEmployeeId())
                .departmentId(workSchedule.getDepartmentId())
                .shift(toShiftResponse(workSchedule.getShift()))
                .workDate(workSchedule.getWorkDate())
                .workModel(workSchedule.getWorkModel())
                .status(workSchedule.getStatus())
                .note(workSchedule.getNote())
                .build();
    }

    private ShiftResponse toShiftResponse(Shift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .breakMinutes(shift.getBreakMinutes())
                .active(shift.getActive())
                .build();
    }
}