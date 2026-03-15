CREATE TABLE department (
                             id BIGINT IDENTITY(1,1) PRIMARY KEY,
                             name NVARCHAR(255) NOT NULL,
                             description NVARCHAR(500),
                             manager_id BIGINT,
                             created_at DATETIME2 DEFAULT GETDATE(),
                             updated_at DATETIME2,
                             deleted BIT DEFAULT 0
);