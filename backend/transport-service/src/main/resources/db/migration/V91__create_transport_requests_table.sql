CREATE TABLE transport_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    employee_name NVARCHAR(200) NOT NULL,
    employee_district NVARCHAR(150) NOT NULL,
    employee_neighborhood NVARCHAR(150) NULL,
    preferred_route_id BIGINT NULL,
    status NVARCHAR(30) NOT NULL,
    note NVARCHAR(1000) NULL,
    review_note NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT df_transport_requests_created_at DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL,
    CONSTRAINT fk_transport_requests_route FOREIGN KEY (preferred_route_id) REFERENCES transport_routes(id),
    CONSTRAINT chk_transport_requests_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

CREATE INDEX ix_transport_requests_employee_id ON transport_requests(employee_id);
CREATE INDEX ix_transport_requests_route_status ON transport_requests(preferred_route_id, status);