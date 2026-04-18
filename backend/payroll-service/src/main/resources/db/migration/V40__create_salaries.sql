CREATE TABLE salaries (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TRY',
    effective_date DATE,
    created_at DATETIME DEFAULT GETDATE()
);