CREATE TABLE employee_job_info (
    id BIGINT IDENTITY(1,1) CONSTRAINT pk_employee_job_info PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    department_id BIGINT,
    position_name NVARCHAR(100),
    CONSTRAINT fk_employee_job_info_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT uq_employee_job_info_employee_id UNIQUE (employee_id)
);