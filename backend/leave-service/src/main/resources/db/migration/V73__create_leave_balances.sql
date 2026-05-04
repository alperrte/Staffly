CREATE TABLE leave.leave_balances (
                                      id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                      employee_id BIGINT NOT NULL,
                                      leave_type_id BIGINT NOT NULL,

                                      remaining_days INT DEFAULT 0,
                                      remaining_hours INT DEFAULT 0,

                                      updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                      CONSTRAINT fk_leave_balances_type
                                          FOREIGN KEY (leave_type_id) REFERENCES leave.leave_types(id)
);