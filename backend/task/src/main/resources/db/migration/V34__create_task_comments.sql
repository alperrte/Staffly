CREATE TABLE task.task_comments (
    id BIGINT IDENTITY PRIMARY KEY,
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),

    CONSTRAINT fk_comment_task
        FOREIGN KEY (task_id) REFERENCES task.tasks(id)
);