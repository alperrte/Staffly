CREATE TABLE sub_departments (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                 department_id BIGINT NOT NULL,
                                 name NVARCHAR(255) NOT NULL,
                                 description NVARCHAR(500) NULL,
                                 manager_id BIGINT NULL,
                                 created_at DATETIME2 DEFAULT GETDATE(),
                                 updated_at DATETIME2 NULL,
                                 deleted BIT DEFAULT 0,

                                 CONSTRAINT fk_sub_departments_department
                                     FOREIGN KEY (department_id) REFERENCES department(id)
);

ALTER TABLE sub_departments
    ADD CONSTRAINT uq_sub_departments_department_id_name
        UNIQUE (department_id, name);