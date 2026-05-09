package com.staffly.work_schedule_service.controller;

import com.staffly.work_schedule_service.dto.request.CreateCompanyHolidayRequest;
import com.staffly.work_schedule_service.dto.request.UpdateCompanyHolidayRequest;
import com.staffly.work_schedule_service.dto.response.CompanyHolidayResponse;
import com.staffly.work_schedule_service.service.CompanyHolidayService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/company-holidays")
@RequiredArgsConstructor
public class CompanyHolidayController {

    private final CompanyHolidayService companyHolidayService;

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PostMapping
    public CompanyHolidayResponse createHoliday(
            @RequestBody CreateCompanyHolidayRequest request
    ) {
        return companyHolidayService.createHoliday(request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping
    public List<CompanyHolidayResponse> getAllHolidays() {
        return companyHolidayService.getAllHolidays();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/active")
    public List<CompanyHolidayResponse> getActiveHolidays() {
        return companyHolidayService.getActiveHolidays();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/{id}")
    public CompanyHolidayResponse getHolidayById(@PathVariable Long id) {
        return companyHolidayService.getHolidayById(id);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PutMapping("/{id}")
    public CompanyHolidayResponse updateHoliday(
            @PathVariable Long id,
            @RequestBody UpdateCompanyHolidayRequest request
    ) {
        return companyHolidayService.updateHoliday(id, request);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER')")
    @PatchMapping("/{id}/deactivate")
    public void deactivateHoliday(@PathVariable Long id) {
        companyHolidayService.deactivateHoliday(id);
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE')")
    @GetMapping("/range")
    public List<CompanyHolidayResponse> getHolidaysBetween(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return companyHolidayService.getHolidaysBetween(startDate, endDate);
    }
}