CREATE TABLE department_employees (
                                      id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                      department_id BIGINT NOT NULL,
                                      employee_id BIGINT NOT NULL,
                                      assigned_at DATETIME2 DEFAULT GETDATE(),

                                      CONSTRAINT fk_department
                                          FOREIGN KEY (department_id)
                                              REFERENCES department(id)
);