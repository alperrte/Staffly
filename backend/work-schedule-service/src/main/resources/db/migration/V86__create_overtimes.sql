CREATE TABLE overtimes (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,

                           employee_id BIGINT NOT NULL,
                           department_id BIGINT NULL,

                           overtime_date DATE NOT NULL,

                           start_time TIME NOT NULL,
                           end_time TIME NOT NULL,

                           reason NVARCHAR(500) NULL,

                           status NVARCHAR(30) NOT NULL DEFAULT 'PLANNED',

                           created_by BIGINT NULL,

                           created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                           updated_at DATETIME2 NULL,

                           CONSTRAINT CHK_overtime_status
                               CHECK (status IN ('PLANNED', 'UPDATED', 'CANCELLED', 'COMPLETED')),

                           CONSTRAINT CHK_overtime_time
                               CHECK (end_time > start_time)
);

CREATE INDEX IX_overtimes_employee_id
    ON overtimes(employee_id);

CREATE INDEX IX_overtimes_department_id
    ON overtimes(department_id);

CREATE INDEX IX_overtimes_overtime_date
    ON overtimes(overtime_date);