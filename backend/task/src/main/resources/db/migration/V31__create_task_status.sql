CREATE TABLE task.task_status (
    id INT PRIMARY KEY,
    name NVARCHAR(50) NOT NULL
);

INSERT INTO task.task_status (id, name) VALUES
(1, 'TODO'),
(2, 'IN_PROGRESS'),
(3, 'DONE'),
(4, 'CANCELLED');