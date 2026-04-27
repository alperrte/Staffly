CREATE TABLE employee_personal_info (
    id BIGINT IDENTITY(1,1) CONSTRAINT pk_employee_personal_info PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    phone NVARCHAR(20),
    birth_date DATE,
    gender NVARCHAR(20),
    CONSTRAINT fk_employee_personal_info_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT uq_employee_personal_info_employee_id UNIQUE (employee_id)
);