package com.staffly.cv_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostingCreateRequestDto {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Position id cannot be null")
    private Long positionId;

    private String experienceLevel;

    private String employmentType;

    private String workModel;

    private String location;

    private String requirements;

    private String responsibilities;

    private String benefits;

    private String teamInfo;

    private String status;

    private LocalDate applicationDeadline;
}