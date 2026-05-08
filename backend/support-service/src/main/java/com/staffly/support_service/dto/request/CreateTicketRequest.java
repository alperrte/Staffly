package com.staffly.support_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTicketRequest {

    private String title;

    private String description;

    private Long categoryId;

    private String priority;
}