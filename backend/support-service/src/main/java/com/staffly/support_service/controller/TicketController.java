package com.staffly.support_service.controller;

import com.staffly.support_service.dto.request.AssignTicketRequest;
import com.staffly.support_service.dto.request.CreateTicketRequest;
import com.staffly.support_service.dto.request.UpdateTicketStatusRequest;
import com.staffly.support_service.dto.response.TicketResponse;
import com.staffly.support_service.service.TicketService;

import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // CREATE
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @RequestBody CreateTicketRequest request,
            HttpServletRequest httpRequest,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(
                ticketService.createTicket(
                        request,
                        authHeader
                )
        );
    }

    // UPDATE STATUS
    @PutMapping("/{ticketId}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestBody UpdateTicketStatusRequest request
    ) {

        return ResponseEntity.ok(
                ticketService.updateTicketStatus(
                        ticketId,
                        request.getStatusId(),
                        request.getResolution()
                )
        );
    }

    // ASSIGN
    @PutMapping("/{ticketId}/assign")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long ticketId,
            @RequestBody AssignTicketRequest request
    ) {

        return ResponseEntity.ok(
                ticketService.assignTicket(
                        ticketId,
                        request.getEmployeeId()
                )
        );
    }

    @PutMapping("/{ticketId}/claim")
    public ResponseEntity<TicketResponse> claimTicket(
            @PathVariable Long ticketId,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(ticketService.claimTicket(ticketId, authHeader));
    }

    // GET BY ID
    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long ticketId
    ) {

        return ResponseEntity.ok(
                ticketService.getTicketById(ticketId)
        );
    }

    // MY TICKETS
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            HttpServletRequest httpRequest,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(
                ticketService.getMyTickets(
                        authHeader
                )
        );
    }

    // ALL TICKETS
    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestHeader("Authorization") String authHeader
    ) {

        return ResponseEntity.ok(
                ticketService.getDepartmentPool(authHeader)
        );
    }
}
