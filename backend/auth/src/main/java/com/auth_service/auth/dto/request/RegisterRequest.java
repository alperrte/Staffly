package com.auth_service.auth.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    private String email;

    private Long employeeId;

    private List<String> roleNames;
}