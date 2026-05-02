package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateShiftRequest;
import com.staffly.work_schedule_service.dto.request.UpdateShiftRequest;
import com.staffly.work_schedule_service.dto.response.ShiftResponse;
import com.staffly.work_schedule_service.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping
    public ShiftResponse createShift(@RequestBody CreateShiftRequest request) {
        return shiftService.createShift(request);
    }

    @GetMapping
    public List<ShiftResponse> getAllShifts() {
        return shiftService.getAllShifts();
    }

    @GetMapping("/active")
    public List<ShiftResponse> getActiveShifts() {
        return shiftService.getActiveShifts();
    }

    @GetMapping("/{id}")
    public ShiftResponse getShiftById(@PathVariable Long id) {
        return shiftService.getShiftById(id);
    }

    @PutMapping("/{id}")
    public ShiftResponse updateShift(
            @PathVariable Long id,
            @RequestBody UpdateShiftRequest request
    ) {
        return shiftService.updateShift(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public void deactivateShift(@PathVariable Long id) {
        shiftService.deactivateShift(id);
    }
}