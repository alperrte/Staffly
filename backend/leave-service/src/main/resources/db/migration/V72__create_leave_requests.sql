CREATE TABLE leave.leave_requests (
                                      id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                      employee_id BIGINT NOT NULL,
                                      leave_type_id BIGINT NOT NULL,

                                      start_datetime DATETIME2 NOT NULL,
                                      end_datetime DATETIME2 NOT NULL,

                                      total_days INT NULL,
                                      total_hours INT NULL,

                                      status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',

                                      reason NVARCHAR(255),

                                      created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                      CONSTRAINT fk_leave_requests_type
                                          FOREIGN KEY (leave_type_id) REFERENCES leave.leave_types(id)
);