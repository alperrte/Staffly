CREATE TABLE leave.leave_approvals (
                                       id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                       leave_request_id BIGINT NOT NULL,
                                       manager_id BIGINT NOT NULL,

                                       action NVARCHAR(20) NOT NULL, -- APPROVED / REJECTED
                                       comment NVARCHAR(255),

                                       created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                       CONSTRAINT fk_leave_approvals_request
                                           FOREIGN KEY (leave_request_id) REFERENCES leave.leave_requests(id)
);