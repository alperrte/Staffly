package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.client.WorkDepartmentClient;
import com.staffly.work_schedule_service.client.WorkEmployeeClient;
import com.staffly.work_schedule_service.client.response.EmployeeResponse;
import com.staffly.work_schedule_service.dto.request.CreateBulkWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.CreateWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.UpdateWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.WorkScheduleResponse;
import com.staffly.work_schedule_service.entity.WorkSchedule;
import com.staffly.work_schedule_service.repository.CompanyHolidayRepository;
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
    private final CompanyHolidayRepository companyHolidayRepository;

    private final WorkEmployeeClient workEmployeeClient;
    private final WorkDepartmentClient workDepartmentClient;

    public WorkScheduleResponse createWorkSchedule(CreateWorkScheduleRequest request) {
        workEmployeeClient.getEmployeeById(request.getEmployeeId());

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        if (companyHolidayRepository.existsByHolidayDate(request.getWorkDate())) {
            throw new RuntimeException("Bu tarih şirket tatili olduğu için çalışma planı atanamaz.");
        }

        if (workScheduleRepository.existsByEmployeeIdAndWorkDate(
                request.getEmployeeId(),
                request.getWorkDate()
        )) {
            throw new RuntimeException("Bu çalışana bu tarih için zaten çalışma planı atanmış.");
        }

        WorkSchedule workSchedule = WorkSchedule.builder()
                .employeeId(request.getEmployeeId())
                .departmentId(request.getDepartmentId())
                .workDate(request.getWorkDate())
                .workModel(request.getWorkModel())
                .note(request.getNote())
                .build();

        return toResponse(workScheduleRepository.save(workSchedule));
    }

    public List<WorkScheduleResponse> createBulkWorkSchedule(CreateBulkWorkScheduleRequest request) {
        workDepartmentClient.getDepartmentById(request.getDepartmentId());

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
                                .workDate(currentDate)
                                .workModel(request.getWorkModel())
                                .build();

                        responses.add(toResponse(workScheduleRepository.save(workSchedule)));
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
        WorkSchedule workSchedule = workScheduleRepository
                .findByEmployeeIdAndWorkDate(employeeId, workDate)
                .orElseThrow(() -> new RuntimeException("Bu tarihe ait çalışma planı bulunamadı."));

        return toResponse(workSchedule);
    }

    public WorkScheduleResponse cancelWorkSchedule(Long id) {
        WorkSchedule workSchedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Çalışma planı bulunamadı."));

        workScheduleRepository.delete(workSchedule);

        return toResponse(workSchedule);
    }

    public WorkScheduleResponse updateWorkSchedule(Long id, UpdateWorkScheduleRequest request) {
        WorkSchedule workSchedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Çalışma planı bulunamadı."));

        workEmployeeClient.getEmployeeById(request.getEmployeeId());

        if (request.getDepartmentId() != null) {
            workDepartmentClient.getDepartmentById(request.getDepartmentId());
        }

        if (companyHolidayRepository.existsByHolidayDate(request.getWorkDate())) {
            throw new RuntimeException("Bu tarih şirket tatili olduğu için çalışma planı atanamaz.");
        }

        workSchedule.setEmployeeId(request.getEmployeeId());
        workSchedule.setDepartmentId(request.getDepartmentId());
        workSchedule.setWorkDate(request.getWorkDate());
        workSchedule.setWorkModel(request.getWorkModel());
        workSchedule.setNote(request.getNote());

        return toResponse(workScheduleRepository.save(workSchedule));
    }

    private WorkScheduleResponse toResponse(WorkSchedule workSchedule) {
        return WorkScheduleResponse.builder()
                .id(workSchedule.getId())
                .employeeId(workSchedule.getEmployeeId())
                .departmentId(workSchedule.getDepartmentId())
                .workDate(workSchedule.getWorkDate())
                .workModel(workSchedule.getWorkModel())
                .note(workSchedule.getNote())
                .build();
    }
}
