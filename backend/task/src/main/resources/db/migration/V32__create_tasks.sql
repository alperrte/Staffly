CREATE TABLE task.tasks (
    id BIGINT IDENTITY PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),

    status_id INT NOT NULL DEFAULT 1,

    priority NVARCHAR(50),
    due_date DATETIME,

    created_by BIGINT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME,

    is_deleted BIT DEFAULT 0,

    CONSTRAINT fk_task_status
        FOREIGN KEY (status_id) REFERENCES task.task_status(id)
);

-- 🔥 INDEX (performance)
CREATE INDEX idx_tasks_status ON task.tasks(status_id);