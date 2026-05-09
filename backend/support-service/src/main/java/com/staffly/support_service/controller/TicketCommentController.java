package com.staffly.support_service.controller;

import com.staffly.support_service.dto.request.AddTicketCommentRequest;
import com.staffly.support_service.dto.response.TicketCommentResponse;
import com.staffly.support_service.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @PathVariable Long ticketId
    ) {
        return ResponseEntity.ok(ticketService.getComments(ticketId));
    }

    @PostMapping
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long ticketId,
            @RequestBody AddTicketCommentRequest request,
            HttpServletRequest httpRequest,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(
                ticketService.addComment(
                        ticketId,
                        authHeader,
                        request.getComment()
                )
        );
    }
}

