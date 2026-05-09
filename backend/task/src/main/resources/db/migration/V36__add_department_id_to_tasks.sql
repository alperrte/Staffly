ALTER TABLE task.tasks
ADD department_id BIGINT NULL;

-- Index to speed up department queries
CREATE INDEX IX_tasks_department_id
    ON task.tasks(department_id);
