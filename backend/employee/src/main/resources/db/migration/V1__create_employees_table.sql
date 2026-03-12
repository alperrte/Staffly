CREATE TABLE employees (
    id BIGINT IDENTITY(1,1) CONSTRAINT pk_employees PRIMARY KEY,
    employee_number NVARCHAR(50) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    hire_date DATE NOT NULL,
    status NVARCHAR(30) NOT NULL,
    is_deleted BIT NOT NULL CONSTRAINT df_employees_is_deleted DEFAULT 0,
    created_at DATETIME2 NOT NULL CONSTRAINT df_employees_created_at DEFAULT SYSDATETIME(),
    updated_at DATETIME2,
    CONSTRAINT uq_employees_employee_number UNIQUE (employee_number),
    CONSTRAINT uq_employees_email UNIQUE (email)
);