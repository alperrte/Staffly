package com.taskservice.task.service;

import com.taskservice.task.dto.request.*;
import com.taskservice.task.dto.response.*;
import com.taskservice.task.entity.*;
import com.taskservice.task.repository.*;


import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final TaskCommentRepository commentRepository;

    // ✅ CREATE
    public TaskResponse createTask(CreateTaskRequest request) {

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStartDate(request.getStartDate());
        task.setDueDate(request.getDueDate());
        task.setStatusId(1);

        Task saved = taskRepository.save(task);

        return mapToResponse(saved);
    }

    // ✅ ASSIGN
    public void assignTask(Long taskId, Long employeeId) {

        boolean exists = assignmentRepository
                .existsByTaskIdAndEmployeeId(taskId, employeeId);

        if (exists) {
            throw new RuntimeException("Task already assigned to this employee");
        }

        TaskAssignment assignment = new TaskAssignment();
        assignment.setTaskId(taskId);
        assignment.setEmployeeId(employeeId);

        assignmentRepository.save(assignment);
    }

    // ✅ STATUS UPDATE
    public void updateStatus(Long taskId, Integer statusId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatusId(statusId);

        taskRepository.save(task);
    }

    // ✅ COMMENT
    public void addComment(Long taskId, String comment, Long userId) {

        TaskComment taskComment = new TaskComment();
        taskComment.setTaskId(taskId);
        taskComment.setUserId(userId);
        taskComment.setComment(comment);

        commentRepository.save(taskComment);
    }

    public java.util.List<TaskComment> getComments(Long taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    // 🔥 NEW → PAGINATION + FILTER
    public Page<TaskResponse> getTasksByEmployeeWithFilter(
            Long employeeId,
            Integer statusId,
            String priority,
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate,
            Pageable pageable
    ) {

        Page<Task> tasks = taskRepository.findTasksFullFilter(
                employeeId,
                statusId,
                priority,
                startDate,
                endDate,
                pageable
        );

        return tasks.map(this::mapToResponse);
    }

    // 🔥 MAPPER
    private TaskResponse mapToResponse(Task task) {

        TaskResponse res = new TaskResponse();

        res.setId(task.getId());
        res.setTitle(task.getTitle());
        res.setDescription(task.getDescription());
        res.setStatusId(task.getStatusId());
        res.setPriority(task.getPriority());
        res.setStartDate(task.getStartDate());
        res.setDueDate(task.getDueDate());

        return res;
    }
}