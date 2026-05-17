package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.client.WorkDepartmentClient;
import com.staffly.work_schedule_service.dto.request.CreateDepartmentWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.request.UpdateDepartmentWorkScheduleRequest;
import com.staffly.work_schedule_service.dto.response.DepartmentWorkScheduleResponse;
import com.staffly.work_schedule_service.entity.DepartmentWorkSchedule;
import com.staffly.work_schedule_service.repository.DepartmentWorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentWorkScheduleService {

    private final DepartmentWorkScheduleRepository repository;
    private final WorkDepartmentClient workDepartmentClient;

    public DepartmentWorkScheduleResponse create(CreateDepartmentWorkScheduleRequest request) {
        workDepartmentClient.getDepartmentById(request.getDepartmentId());

        repository.findByDepartmentIdAndActiveTrue(request.getDepartmentId())
                .ifPresent(active -> {
                    active.setActive(false);
                    repository.save(active);
                });

        DepartmentWorkSchedule schedule = DepartmentWorkSchedule.builder()
                .departmentId(request.getDepartmentId())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .breakStartTime(request.getBreakStartTime())
                .breakEndTime(request.getBreakEndTime())
                .active(true)
                .build();

        return toResponse(repository.save(schedule));
    }

    public List<DepartmentWorkScheduleResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DepartmentWorkScheduleResponse> getActive() {
        return repository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<DepartmentWorkScheduleResponse> getByDepartment(Long departmentId) {
        workDepartmentClient.getDepartmentById(departmentId);

        return repository.findByDepartmentId(departmentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DepartmentWorkScheduleResponse update(Long id, UpdateDepartmentWorkScheduleRequest request) {
        DepartmentWorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departman çalışma saati bulunamadı."));

        workDepartmentClient.getDepartmentById(request.getDepartmentId());

        schedule.setDepartmentId(request.getDepartmentId());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setBreakStartTime(request.getBreakStartTime());
        schedule.setBreakEndTime(request.getBreakEndTime());

        return toResponse(repository.save(schedule));
    }

    public void deactivate(Long id) {
        DepartmentWorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departman çalışma saati bulunamadı."));

        schedule.setActive(false);
        repository.save(schedule);
    }

    private DepartmentWorkScheduleResponse toResponse(DepartmentWorkSchedule schedule) {
        return DepartmentWorkScheduleResponse.builder()
                .id(schedule.getId())
                .departmentId(schedule.getDepartmentId())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .breakStartTime(schedule.getBreakStartTime())
                .breakEndTime(schedule.getBreakEndTime())
                .active(schedule.getActive())
                .build();
    }

    public DepartmentWorkScheduleResponse activate(Long id) {
        DepartmentWorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department work schedule not found"));

        List<DepartmentWorkSchedule> sameDepartmentSchedules =
                repository.findByDepartmentId(schedule.getDepartmentId());

        for (DepartmentWorkSchedule item : sameDepartmentSchedules) {
            item.setActive(false);
        }

        schedule.setActive(true);

        repository.saveAll(sameDepartmentSchedules);
        DepartmentWorkSchedule saved = repository.save(schedule);

        return toResponse(saved);
    }

    public void delete(Long id) {
        DepartmentWorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departman çalışma saati bulunamadı."));

        repository.delete(schedule);
    }
}