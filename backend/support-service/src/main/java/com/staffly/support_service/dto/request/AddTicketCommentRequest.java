package com.staffly.support_service.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddTicketCommentRequest {

    @JsonAlias({"message"})
    private String comment;
}