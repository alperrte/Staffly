package com.organizationservice.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationResponseDto {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}