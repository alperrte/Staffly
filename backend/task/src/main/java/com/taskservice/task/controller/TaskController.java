package com.taskservice.task.controller;

import com.taskservice.task.dto.request.*;
import com.taskservice.task.dto.response.TaskResponse;
import com.taskservice.task.entity.TaskComment;
import com.taskservice.task.security.JwtService;
import com.taskservice.task.service.TaskService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springdoc.core.annotations.ParameterObject;
import io.swagger.v3.oas.annotations.Parameter;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final JwtService jwtService; //

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody CreateTaskRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {

        String token = authHeader.substring(7);

        Long userId = jwtService.extractUserId(token);

        return ResponseEntity.ok(
                taskService.createTask(request, userId)
        );
    }

    // ✅ ASSIGN
    @PostMapping("/{taskId}/assign")
    public ResponseEntity<String> assignTask(
            @PathVariable Long taskId,
            @RequestBody AssignTaskRequest request
    ) {
        taskService.assignTask(taskId, request.getEmployeeId());
        return ResponseEntity.ok("Task assigned");
    }

    // ✅ STATUS UPDATE
    @PutMapping("/{taskId}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long taskId,
            @RequestBody UpdateTaskStatusRequest request
    ) {
        taskService.updateStatus(taskId, request.getStatusId());
        return ResponseEntity.ok("Status updated");
    }

    // ✅ COMMENT
    @PostMapping("/{taskId}/comments")
    public ResponseEntity<String> addComment(
            @PathVariable Long taskId,
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        Long userId = jwtService.extractUserId(token);

        taskService.addComment(taskId, request.getComment(), userId); // 🔥 artık gerçek user
        return ResponseEntity.ok("Comment added");
    }

    // ✅ GET COMMENTS
    @GetMapping("/{taskId}/comments")
    public ResponseEntity<List<TaskComment>> getComments(
            @PathVariable Long taskId
    ) {
        return ResponseEntity.ok(taskService.getComments(taskId));
    }

    // 🔥 MY TASKS (JWT BASED)
    @GetMapping("/my-tasks")
    public ResponseEntity<Page<TaskResponse>> getMyTasks(

            @RequestHeader("Authorization") String authHeader,

            @Parameter(description = "Filter by status")
            @RequestParam(required = false) Integer statusId,

            @Parameter(description = "Filter by priority")
            @RequestParam(required = false) String priority,

            @Parameter(description = "Start date filter")
            @RequestParam(required = false) java.time.LocalDateTime startDate,

            @Parameter(description = "End date filter")
            @RequestParam(required = false) java.time.LocalDateTime endDate,

            @ParameterObject Pageable pageable
    ) {

        String token = authHeader.substring(7);
        Long userId = jwtService.extractUserId(token); // 🔥 BURASI ASIL OLAY

        return ResponseEntity.ok(
                taskService.getTasksByEmployeeWithFilter(
                        userId,
                        statusId,
                        priority,
                        startDate,
                        endDate,
                        pageable
                )
        );
    }
}