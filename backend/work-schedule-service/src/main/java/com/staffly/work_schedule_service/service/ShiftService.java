package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.dto.request.CreateShiftRequest;
import com.staffly.work_schedule_service.dto.request.UpdateShiftRequest;
import com.staffly.work_schedule_service.dto.response.ShiftResponse;
import com.staffly.work_schedule_service.entity.Shift;
import com.staffly.work_schedule_service.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftResponse createShift(CreateShiftRequest request) {

        if (shiftRepository.existsByName(request.getName())) {
            throw new RuntimeException("Bu isimde bir mesai şablonu zaten var.");
        }

        Shift shift = Shift.builder()
                .name(request.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .breakMinutes(request.getBreakMinutes())
                .active(true)
                .build();

        Shift savedShift = shiftRepository.save(shift);

        return toResponse(savedShift);
    }

    public List<ShiftResponse> getAllShifts() {
        return shiftRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ShiftResponse> getActiveShifts() {
        return shiftRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ShiftResponse getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesai şablonu bulunamadı."));

        return toResponse(shift);
    }

    public ShiftResponse updateShift(Long id, UpdateShiftRequest request) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesai şablonu bulunamadı."));

        shift.setName(request.getName());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setBreakMinutes(request.getBreakMinutes());
        shift.setActive(request.getActive());

        Shift updatedShift = shiftRepository.save(shift);

        return toResponse(updatedShift);
    }

    public void deactivateShift(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesai şablonu bulunamadı."));

        shift.setActive(false);
        shiftRepository.save(shift);
    }

    private ShiftResponse toResponse(Shift shift) {
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