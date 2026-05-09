package com.taskservice.task.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskservice.task.dto.request.AssignTaskRequest;
import com.taskservice.task.dto.request.CommentRequest;
import com.taskservice.task.dto.request.CreateTaskRequest;
import com.taskservice.task.dto.request.UpdateTaskStatusRequest;
import com.taskservice.task.dto.response.TaskResponse;
import com.taskservice.task.entity.TaskComment;
import com.taskservice.task.security.JwtService;
import com.taskservice.task.service.TaskService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final JwtService jwtService; //

    // ✅ CREATE
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER','DEPARTMENT_MANAGER')")
    public ResponseEntity<TaskResponse> createTask(
            @RequestBody CreateTaskRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {

        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        Long userId = token != null ? jwtService.extractUserId(token) : null;

        return ResponseEntity.ok(
                taskService.createTask(request, userId, authHeader)
        );
    }

    // ✅ ASSIGN
        @PostMapping("/{taskId}/assign")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER','DEPARTMENT_MANAGER')")
        public ResponseEntity<String> assignTask(
                        @PathVariable Long taskId,
                        @RequestHeader(value = "Authorization", required = false) String authHeader,
                        @RequestBody AssignTaskRequest request
        ) {
                taskService.assignTask(taskId, request.getEmployeeId(), authHeader);
                return ResponseEntity.ok("Task assigned");
        }

    // ✅ STATUS UPDATE
    @PutMapping("/{taskId}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER','EMPLOYEE')")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long taskId,
            @RequestBody UpdateTaskStatusRequest request
    ) {
        taskService.updateStatus(taskId, request.getStatusId());
        return ResponseEntity.ok("Status updated");
    }

    // ✅ COMMENT
    @PostMapping("/{taskId}/comments")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','MANAGER','EMPLOYEE')")
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
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','MANAGER','DEPARTMENT_MANAGER','EMPLOYEE')")
    public ResponseEntity<List<TaskComment>> getComments(
            @PathVariable Long taskId
    ) {
        return ResponseEntity.ok(taskService.getComments(taskId));
    }

    // 🔥 MY TASKS (JWT BASED)
    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','MANAGER','DEPARTMENT_MANAGER','EMPLOYEE')")
    public ResponseEntity<Page<TaskResponse>> getMyTasks(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                taskService.getTasksByEmployeeWithFilter(
                        authHeader,
                        statusId,
                        priority,
                        startDate,
                        endDate,
                        pageable
                )
        );
    }

        @GetMapping
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','MANAGER','DEPARTMENT_MANAGER','EMPLOYEE')")
        public ResponseEntity<Page<TaskResponse>> getAllTasks(
                @RequestHeader("Authorization") String authHeader,
                Pageable pageable
        ) {
                return ResponseEntity.ok(taskService.getAllTasks(authHeader, pageable));
        }
}