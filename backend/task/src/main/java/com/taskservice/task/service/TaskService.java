package com.taskservice.task.service;

import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.taskservice.task.client.AuthClient;
import com.taskservice.task.client.EmployeeClient;
import com.taskservice.task.security.JwtService;
import com.taskservice.task.dto.request.CreateTaskRequest;
import com.taskservice.task.dto.response.CurrentUserResponse;
import com.taskservice.task.dto.response.EmployeeLookupResponse;
import com.taskservice.task.dto.response.TaskResponse;
import com.taskservice.task.entity.Task;
import com.taskservice.task.entity.TaskAssignment;
import com.taskservice.task.entity.TaskComment;
import com.taskservice.task.repository.TaskAssignmentRepository;
import com.taskservice.task.repository.TaskCommentRepository;
import com.taskservice.task.repository.TaskRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final TaskCommentRepository commentRepository;
    private final AuthClient authClient;
    private final EmployeeClient employeeClient;
    private final JwtService jwtService;

    // ✅ CREATE (EMAIL BASED)
    // ✅ CREATE (USER ID BASED)
    public TaskResponse createTask(CreateTaskRequest request, Long userId, String authHeader) {

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatusId(1);
        task.setPriority(request.getPriority());

        task.setStartDate(request.getStartDate()); //
        task.setDueDate(request.getDueDate());

        task.setCreatedBy(userId);

        // If creator is DEPARTMENT_MANAGER, set task.departmentId automatically
        if (authHeader != null && !authHeader.isBlank()) {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            java.util.List<String> roles = jwtService.extractRoles(token);
            boolean isDeptManager = roles.stream().anyMatch(r -> r.equalsIgnoreCase("ROLE_DEPARTMENT_MANAGER") || r.equalsIgnoreCase("DEPARTMENT_MANAGER"));

            if (isDeptManager) {
                var current = authClient.getCurrentUser(authHeader);
                if (current != null && current.getEmployeeId() != null) {
                    var managerInfo = employeeClient.getEmployeeById(authHeader, current.getEmployeeId());
                    if (managerInfo != null && managerInfo.getDepartmentId() != null) {
                        task.setDepartmentId(managerInfo.getDepartmentId());
                    }
                }
            } else if (request.getDepartmentId() != null) {
                task.setDepartmentId(request.getDepartmentId());
            }
        } else if (request.getDepartmentId() != null) {
            task.setDepartmentId(request.getDepartmentId());
        }

        task = taskRepository.save(task); //

        return mapToResponse(task);
    }

    // ✅ ASSIGN
    public void assignTask(Long taskId, Long employeeId, String authHeader) {

        boolean exists = assignmentRepository
            .existsByTaskIdAndEmployeeId(taskId, employeeId);

        if (exists) {
            throw new RuntimeException("Task already assigned to this employee");
        }

        // If caller is DEPARTMENT_MANAGER, ensure assignee is in same department
        if (authHeader != null && !authHeader.isBlank()) {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            java.util.List<String> roles = jwtService.extractRoles(token);
            boolean isDeptManager = roles.stream().anyMatch(r -> r.equalsIgnoreCase("ROLE_DEPARTMENT_MANAGER") || r.equalsIgnoreCase("DEPARTMENT_MANAGER"));

            if (isDeptManager) {
                // get current user's employee id
                var current = authClient.getCurrentUser(authHeader);
                if (current == null || current.getEmployeeId() == null) {
                    throw new RuntimeException("Current manager employee info not found");
                }

                var managerInfo = employeeClient.getEmployeeById(authHeader, current.getEmployeeId());
                var assigneeInfo = employeeClient.getEmployeeById(authHeader, employeeId);

                if (managerInfo == null || managerInfo.getDepartmentId() == null) {
                    throw new RuntimeException("Manager department information missing");
                }

                if (assigneeInfo == null || assigneeInfo.getDepartmentId() == null) {
                    throw new RuntimeException("Assignee employee department information missing");
                }

                if (!managerInfo.getDepartmentId().equals(assigneeInfo.getDepartmentId())) {
                    throw new RuntimeException("You can only assign tasks to employees within your department");
                }
            }
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

        // 🔥 KURAL
        if (task.getStatusId() == 4) {
            throw new RuntimeException("Cancelled task cannot be updated");
        }

        task.setStatusId(statusId);
        taskRepository.save(task);
    }

    // ✅ COMMENT (EMAIL BASED)
    public void addComment(Long taskId, String comment, Long userId) {

        TaskComment taskComment = new TaskComment();
        taskComment.setTaskId(taskId);
        taskComment.setUserId(userId); // 🔥 DOĞRU
        taskComment.setComment(comment);

        commentRepository.save(taskComment);
    }

    public java.util.List<TaskComment> getComments(Long taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    // 🔥 FILTER
    public Page<TaskResponse> getTasksByEmployeeWithFilter(
            String authHeader,
            Integer statusId,
            String priority,
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate,
            Pageable pageable
    ) {

        CurrentUserResponse currentUser = authClient.getCurrentUser(authHeader);
        Long employeeId = null;

        if (currentUser != null) {
            employeeId = currentUser.getEmployeeId();

            boolean hasValidEmployeeId = employeeId != null
                    && employeeId > 0
                    && employeeClient.isEmployeeExists(authHeader, employeeId);

            if (!hasValidEmployeeId && currentUser.getEmail() != null) {
                EmployeeLookupResponse employee = employeeClient.getEmployeeByEmail(authHeader, currentUser.getEmail());
                if (employee != null) {
                    employeeId = employee.getId();
                } else {
                    employeeId = null;
                }
            }
        }

        if (currentUser == null) {
            return new PageImpl<>(java.util.List.of(), pageable, 0);
        }

        if (employeeId == null) {
            return new PageImpl<>(java.util.List.of(), pageable, 0);
        }

        Page<Task> tasks = taskRepository.findMyTasksFullFilter(
                employeeId,
                statusId,
                priority,
                startDate,
                endDate,
                pageable
        );

        return tasks.map(task -> mapToResponse(task, authHeader));
    }

    public Page<TaskResponse> getAllTasks(String authHeader, Pageable pageable) {
        Page<Task> tasks = taskRepository.findAll(pageable);
        return tasks.map(task -> mapToResponse(task, authHeader));
    }

    private TaskResponse mapToResponse(Task task) {
        return mapToResponse(task, null);
    }

    // 🔥 MAPPER
    private TaskResponse mapToResponse(Task task, String authHeader) {

        TaskResponse res = new TaskResponse();

        res.setId(task.getId());
        res.setTitle(task.getTitle());
        res.setDescription(task.getDescription());
        res.setStatusId(task.getStatusId());
        res.setPriority(task.getPriority());
        res.setStartDate(task.getStartDate());
        res.setDueDate(task.getDueDate());
        res.setCreatedAt(task.getCreatedAt());
        res.setUpdatedAt(task.getUpdatedAt());

        java.util.List<Long> assigneeEmployeeIds = assignmentRepository.findByTaskId(task.getId()).stream()
            .map(TaskAssignment::getEmployeeId)
            .collect(Collectors.toList());

        res.setAssigneeEmployeeIds(assigneeEmployeeIds);
        res.setDepartmentId(task.getDepartmentId());
        if (authHeader != null && !authHeader.isBlank()) {
            res.setAssigneeEmails(
                assigneeEmployeeIds.stream()
                    .map(employeeId -> employeeClient.getEmployeeById(authHeader, employeeId))
                    .filter(java.util.Objects::nonNull)
                    .map(EmployeeLookupResponse::getEmail)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList())
            );
        } else {
            res.setAssigneeEmails(java.util.List.of());
        }

        return res;
    }
}