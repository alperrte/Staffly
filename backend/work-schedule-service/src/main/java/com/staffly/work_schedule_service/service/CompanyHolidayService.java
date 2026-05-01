package com.staffly.work_schedule_service.service;

import com.staffly.work_schedule_service.dto.request.CreateCompanyHolidayRequest;
import com.staffly.work_schedule_service.dto.request.UpdateCompanyHolidayRequest;
import com.staffly.work_schedule_service.dto.response.CompanyHolidayResponse;
import com.staffly.work_schedule_service.entity.CompanyHoliday;
import com.staffly.work_schedule_service.repository.CompanyHolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyHolidayService {

    private final CompanyHolidayRepository companyHolidayRepository;

    public CompanyHolidayResponse createHoliday(CreateCompanyHolidayRequest request) {

        if (companyHolidayRepository.existsByHolidayDate(request.getHolidayDate())) {
            throw new RuntimeException("Bu tarih için zaten tatil kaydı var.");
        }

        CompanyHoliday holiday = CompanyHoliday.builder()
                .name(request.getName())
                .holidayDate(request.getHolidayDate())
                .description(request.getDescription())
                .active(true)
                .build();

        CompanyHoliday savedHoliday = companyHolidayRepository.save(holiday);

        return toResponse(savedHoliday);
    }

    public List<CompanyHolidayResponse> getAllHolidays() {
        return companyHolidayRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CompanyHolidayResponse> getActiveHolidays() {
        return companyHolidayRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CompanyHolidayResponse> getHolidaysBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {
        return companyHolidayRepository.findByHolidayDateBetween(startDate, endDate)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CompanyHolidayResponse getHolidayById(Long id) {
        CompanyHoliday holiday = companyHolidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tatil kaydı bulunamadı."));

        return toResponse(holiday);
    }

    public CompanyHolidayResponse updateHoliday(Long id, UpdateCompanyHolidayRequest request) {

        CompanyHoliday holiday = companyHolidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tatil kaydı bulunamadı."));

        holiday.setName(request.getName());
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setDescription(request.getDescription());
        holiday.setActive(request.getActive());

        CompanyHoliday updatedHoliday = companyHolidayRepository.save(holiday);

        return toResponse(updatedHoliday);
    }

    public void deactivateHoliday(Long id) {

        CompanyHoliday holiday = companyHolidayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tatil kaydı bulunamadı."));

        holiday.setActive(false);

        companyHolidayRepository.save(holiday);
    }

    private CompanyHolidayResponse toResponse(CompanyHoliday holiday) {
        return CompanyHolidayResponse.builder()
                .id(holiday.getId())
                .name(holiday.getName())
                .holidayDate(holiday.getHolidayDate())
                .description(holiday.getDescription())
                .active(holiday.getActive())
                .build();
    }
}