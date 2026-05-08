package com.staffly.support_service.service;

import com.staffly.support_service.client.EmployeeClient;
import com.staffly.support_service.dto.request.CreateTicketRequest;
import com.staffly.support_service.dto.response.TicketCommentResponse;
import com.staffly.support_service.dto.response.TicketResponse;
import com.staffly.support_service.entity.Ticket;
import com.staffly.support_service.entity.TicketCategory;
import com.staffly.support_service.entity.TicketComment;
import com.staffly.support_service.entity.TicketStatus;
import com.staffly.support_service.repository.TicketCategoryRepository;
import com.staffly.support_service.repository.TicketCommentRepository;
import com.staffly.support_service.repository.TicketRepository;
import com.staffly.support_service.repository.TicketStatusRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketStatusRepository statusRepository;
    private final TicketCategoryRepository categoryRepository;
    private final TicketCommentRepository commentRepository;
    private final EmployeeClient employeeClient;

    // CREATE TICKET
    public TicketResponse createTicket(
            CreateTicketRequest request,
            String authHeader
    ) {

        Long employeeId =
                employeeClient.getEmployeeIdByEmail(
                        authHeader
                );

        TicketStatus openStatus = statusRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Status not found"));

        TicketCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .employeeId(employeeId)
                .priority(request.getPriority())
                .status(openStatus)
                .category(category)
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        return mapToResponse(saved);
    }

    // MY TICKETS
    public List<TicketResponse> getMyTickets(
            String authHeader
    ) {

        Long employeeId =
                employeeClient.getEmployeeIdByEmail(
                        authHeader
                );

        return ticketRepository
                .findByEmployeeIdAndIsDeletedFalseOrderByCreatedAtDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ALL TICKETS
    public List<TicketResponse> getAllTickets() {

        return ticketRepository
                .findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE STATUS
    public TicketResponse updateTicketStatus(
            Long ticketId,
            Long statusId
    ) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketStatus status = statusRepository.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Status not found"));

        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (status.getName().equals("RESOLVED")) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        Ticket updated = ticketRepository.save(ticket);

        return mapToResponse(updated);
    }

    // ADD COMMENT
    public TicketCommentResponse addComment(
            Long ticketId,
            String authHeader,
            String commentText
    ) {

        Long employeeId =
                employeeClient.getEmployeeIdByEmail(
                        authHeader
                );

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .employeeId(employeeId)
                .comment(commentText)
                .createdAt(LocalDateTime.now())
                .build();

        TicketComment saved =
                commentRepository.save(comment);

        return TicketCommentResponse.builder()
                .id(saved.getId())
                .employeeId(saved.getEmployeeId())
                .comment(saved.getComment())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // GET COMMENTS
    public List<TicketCommentResponse> getComments(
            Long ticketId
    ) {

        return commentRepository.findByTicketId(ticketId)
                .stream()
                .map(comment -> TicketCommentResponse.builder()
                        .id(comment.getId())
                        .employeeId(comment.getEmployeeId())
                        .comment(comment.getComment())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .toList();
    }

    // ASSIGN TICKET
    public TicketResponse assignTicket(
            Long ticketId,
            Long employeeId
    ) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setAssignedTo(employeeId);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updated = ticketRepository.save(ticket);

        return mapToResponse(updated);
    }

    // GET BY ID
    public TicketResponse getTicketById(Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        return mapToResponse(ticket);
    }

    // MAPPER
    private TicketResponse mapToResponse(Ticket ticket) {

        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus().getName())
                .category(ticket.getCategory().getName())
                .employeeId(ticket.getEmployeeId())
                .assignedTo(ticket.getAssignedTo())
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}