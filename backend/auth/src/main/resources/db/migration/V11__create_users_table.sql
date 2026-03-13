CREATE TABLE users (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       email NVARCHAR(100) NOT NULL UNIQUE,
                       password_hash NVARCHAR(255) NOT NULL,
                       is_active BIT DEFAULT 1,
                       created_at DATETIME2 DEFAULT GETDATE(),
                       updated_at DATETIME2
);