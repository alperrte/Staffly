CREATE TABLE leave.leave_types (
                                   id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                   name NVARCHAR(100) NOT NULL,

                                   description NVARCHAR(255),

                                   is_hourly BIT NOT NULL DEFAULT 0,

                                   created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);