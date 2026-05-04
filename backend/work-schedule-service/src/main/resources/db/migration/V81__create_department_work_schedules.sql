CREATE TABLE department_work_schedules (
                                           id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                           department_id BIGINT NOT NULL,

                                           start_time TIME NOT NULL,
                                           end_time TIME NOT NULL,

                                           break_start_time TIME NULL,
                                           break_end_time TIME NULL,

                                           is_active BIT NOT NULL DEFAULT 1,

                                           created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                           updated_at DATETIME2 NULL,

                                           CONSTRAINT CHK_department_work_time
                                               CHECK (end_time > start_time),

                                           CONSTRAINT CHK_department_break_time
                                               CHECK (
                                                   break_start_time IS NULL
                                                       OR break_end_time IS NULL
                                                       OR break_end_time > break_start_time
                                                   )
);

CREATE INDEX IX_department_work_schedules_department_id
    ON department_work_schedules(department_id);

CREATE UNIQUE INDEX UQ_department_active_work_schedule
    ON department_work_schedules(department_id)
    WHERE is_active = 1;