CREATE TABLE payrolls (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(10,2),
    total_bonus DECIMAL(10,2),
    total_deduction DECIMAL(10,2),
    net_salary DECIMAL(10,2),
    status VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);