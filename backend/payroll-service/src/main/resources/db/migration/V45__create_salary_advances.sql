CREATE TABLE salary_advances (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    request_date DATE,
    approved BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);