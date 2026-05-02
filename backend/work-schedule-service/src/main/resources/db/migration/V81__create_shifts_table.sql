CREATE TABLE shifts (
                        id BIGINT IDENTITY(1,1) PRIMARY KEY,

                        name NVARCHAR(100) NOT NULL,
                        start_time TIME NOT NULL,
                        end_time TIME NOT NULL,
                        break_minutes INT NOT NULL DEFAULT 0,

                        is_active BIT NOT NULL DEFAULT 1,

                        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                        updated_at DATETIME2 NULL,

                        CONSTRAINT UQ_shifts_name UNIQUE (name)
);