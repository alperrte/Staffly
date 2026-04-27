CREATE TABLE roles (
                       id BIGINT IDENTITY(1,1) PRIMARY KEY,
                       name NVARCHAR(50) NOT NULL UNIQUE,
                       description NVARCHAR(255)
);

INSERT INTO roles (name, description) VALUES
                                          ('ADMIN', 'System administrator with full access'),
                                          ('HR', 'Human resources management role'),
                                          ('MANAGER', 'Department manager role'),
                                          ('USER', 'Default employee role');