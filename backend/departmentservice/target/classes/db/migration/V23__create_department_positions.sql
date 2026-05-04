CREATE TABLE department_positions (
                                      id BIGINT IDENTITY(1,1) PRIMARY KEY,
                                      sub_department_id BIGINT NOT NULL,
                                      name NVARCHAR(255) NOT NULL,
                                      description NVARCHAR(500) NULL,
                                      created_at DATETIME2 DEFAULT GETDATE(),
                                      updated_at DATETIME2 NULL,
                                      deleted BIT DEFAULT 0,

                                      CONSTRAINT fk_department_positions_sub_department
                                          FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id)
);

ALTER TABLE department_positions
    ADD CONSTRAINT uq_department_positions_sub_department_id_name
        UNIQUE (sub_department_id, name);