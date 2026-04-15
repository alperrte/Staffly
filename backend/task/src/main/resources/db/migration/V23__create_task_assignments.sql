CREATE TABLE task.task_assignments (
    id BIGINT IDENTITY PRIMARY KEY,

    task_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,

    assigned_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT fk_assignment_task
        FOREIGN KEY (task_id) REFERENCES task.tasks(id)
);

-- 🔥 INDEXLER (çok önemli)
CREATE INDEX idx_assignments_task ON task.task_assignments(task_id);
CREATE INDEX idx_assignments_employee ON task.task_assignments(employee_id);

-- 🔥 UNIQUE (aynı kişiye aynı görev 2 kez atanmasın)
ALTER TABLE task.task_assignments
ADD CONSTRAINT unique_task_employee UNIQUE (task_id, employee_id);