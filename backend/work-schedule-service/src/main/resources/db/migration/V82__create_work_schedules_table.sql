CREATE TABLE work_schedules (
                                id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                employee_id BIGINT NOT NULL,
                                department_id BIGINT NULL,
                                shift_id BIGINT NOT NULL,

                                work_date DATE NOT NULL,

                                work_model NVARCHAR(30) NOT NULL,
                                status NVARCHAR(30) NOT NULL DEFAULT 'PLANNED',

                                note NVARCHAR(500) NULL,
                                created_by BIGINT NULL,

                                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                updated_at DATETIME2 NULL,

                                CONSTRAINT FK_work_schedules_shift
                                    FOREIGN KEY (shift_id)
                                        REFERENCES shifts(id),

                                CONSTRAINT CHK_work_model
                                    CHECK (work_model IN ('OFFICE', 'HOME_OFFICE', 'HYBRID', 'REMOTE', 'DAY_OFF')),

                                CONSTRAINT CHK_work_schedule_status
                                    CHECK (status IN ('PLANNED', 'UPDATED', 'CANCELLED')),

                                CONSTRAINT UQ_employee_date
                                    UNIQUE (employee_id, work_date)
);

CREATE INDEX IX_work_schedules_employee_id
    ON work_schedules(employee_id);

CREATE INDEX IX_work_schedules_department_id
    ON work_schedules(department_id);

CREATE INDEX IX_work_schedules_work_date
    ON work_schedules(work_date);