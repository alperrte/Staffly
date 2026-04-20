package com.organizationservice.controller;

import com.organizationservice.dto.request.OrganizationRequestDto;
import com.organizationservice.dto.response.OrganizationResponseDto;
import com.organizationservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public OrganizationResponseDto createOrganization(@RequestBody OrganizationRequestDto request) {
        return organizationService.createOrganization(request);
    }

    @GetMapping
    public List<OrganizationResponseDto> getAllOrganizations() {
        return organizationService.getAllOrganizations();
    }
}