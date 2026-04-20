package com.organizationservice.service;

import com.organizationservice.dto.request.OrganizationRequestDto;
import com.organizationservice.dto.response.OrganizationResponseDto;
import com.organizationservice.entity.Organization;
import com.organizationservice.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationResponseDto createOrganization(OrganizationRequestDto request) {

        Organization organization = Organization.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build();

        Organization saved = organizationRepository.save(organization);

        return OrganizationResponseDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<OrganizationResponseDto> getAllOrganizations() {

        return organizationRepository.findByDeletedFalse()
                .stream()
                .map(org -> OrganizationResponseDto.builder()
                        .id(org.getId())
                        .name(org.getName())
                        .description(org.getDescription())
                        .createdAt(org.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}