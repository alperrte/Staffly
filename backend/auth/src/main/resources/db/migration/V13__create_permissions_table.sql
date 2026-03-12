CREATE TABLE permissions (
                             id BIGINT IDENTITY(1,1) PRIMARY KEY,
                             name NVARCHAR(100) NOT NULL UNIQUE,
                             description NVARCHAR(255)
);