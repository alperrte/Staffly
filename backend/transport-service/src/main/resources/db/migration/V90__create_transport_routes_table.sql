CREATE TABLE transport_routes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    route_code NVARCHAR(60) NOT NULL,
    route_name NVARCHAR(150) NOT NULL,
    description NVARCHAR(1000) NULL,
    origin_area NVARCHAR(150) NOT NULL,
    destination_area NVARCHAR(150) NOT NULL,
    service_areas NVARCHAR(1000) NOT NULL,
    capacity INT NOT NULL,
    active BIT NOT NULL CONSTRAINT df_transport_routes_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT df_transport_routes_created_at DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NULL,
    CONSTRAINT uq_transport_routes_code UNIQUE (route_code)
);

CREATE INDEX ix_transport_routes_active ON transport_routes(active);