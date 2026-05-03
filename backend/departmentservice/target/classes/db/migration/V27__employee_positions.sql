CREATE TABLE employee_positions (
                                    id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                    employee_id BIGINT NOT NULL,
                                    position_id BIGINT NOT NULL,

                                    created_at DATETIME2 DEFAULT GETDATE(),

                                    CONSTRAINT fk_employee_positions_position
                                        FOREIGN KEY (position_id) REFERENCES department_positions(id)
);

ALTER TABLE employee_positions
    ADD CONSTRAINT uq_employee_position UNIQUE (employee_id, position_id);