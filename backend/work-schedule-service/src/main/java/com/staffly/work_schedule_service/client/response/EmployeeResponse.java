package com.staffly.work_schedule_service.client.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {

    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    private Long departmentId;
    private Long subDepartmentId;
    private Long positionId;

    private String departmentName;
    private String subDepartmentName;
    private String positionName;

    private Boolean active;
}