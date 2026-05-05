-- Adds map-friendly stop coordinates for each seeded transport route.
CREATE TABLE transport_route_stops (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    route_id BIGINT NOT NULL,
    stop_order INT NOT NULL,
    stop_name NVARCHAR(200) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT df_transport_route_stops_created_at DEFAULT SYSDATETIME(),
    CONSTRAINT fk_transport_route_stops_route FOREIGN KEY (route_id) REFERENCES transport_routes(id) ON DELETE CASCADE,
    CONSTRAINT uq_transport_route_stops_route_order UNIQUE (route_id, stop_order)
);

CREATE INDEX ix_transport_route_stops_route_id ON transport_route_stops(route_id);

INSERT INTO transport_route_stops (route_id, stop_order, stop_name, latitude, longitude)
VALUES
    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-01'), 1, N'Gebze Merkez', 40.802800, 29.430700),
    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-01'), 2, N'Darıca Merkez', 40.774400, 29.400300),
    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-01'), 3, N'Şekerpınar Sanayi', 40.880200, 29.372900),

    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-02'), 1, N'Gebze Merkez', 40.802800, 29.430700),
    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-02'), 2, N'Çayırova', 40.827300, 29.371800),
    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-02'), 3, N'Şekerpınar', 40.878900, 29.377600),

    ((SELECT id FROM transport_routes WHERE route_code = N'GBH-01'), 1, N'Gebze Otogar', 40.804800, 29.430400),
    ((SELECT id FROM transport_routes WHERE route_code = N'GBH-01'), 2, N'Darıca', 40.774400, 29.400300),
    ((SELECT id FROM transport_routes WHERE route_code = N'GBH-01'), 3, N'Sabiha Gökçen Havalimanı', 40.898600, 29.309200),

    ((SELECT id FROM transport_routes WHERE route_code = N'KAV-01'), 1, N'Kavacık', 41.104800, 29.083900),
    ((SELECT id FROM transport_routes WHERE route_code = N'KAV-01'), 2, N'Beykoz', 41.134800, 29.095700),
    ((SELECT id FROM transport_routes WHERE route_code = N'KAV-01'), 3, N'Gebze Merkez', 40.802800, 29.430700),

    ((SELECT id FROM transport_routes WHERE route_code = N'IST-01'), 1, N'Kavacık', 41.104800, 29.083900),
    ((SELECT id FROM transport_routes WHERE route_code = N'IST-01'), 2, N'Kartal', 40.899600, 29.185300),
    ((SELECT id FROM transport_routes WHERE route_code = N'IST-01'), 3, N'Çayırova', 40.827300, 29.371800),
    ((SELECT id FROM transport_routes WHERE route_code = N'IST-01'), 4, N'Şekerpınar', 40.878900, 29.377600),

    ((SELECT id FROM transport_routes WHERE route_code = N'DAR-01'), 1, N'Darıca Merkez', 40.774400, 29.400300),
    ((SELECT id FROM transport_routes WHERE route_code = N'DAR-01'), 2, N'Körfez Yolu', 40.780900, 29.416000),
    ((SELECT id FROM transport_routes WHERE route_code = N'DAR-01'), 3, N'Darıca Merkez', 40.774400, 29.400300),

    ((SELECT id FROM transport_routes WHERE route_code = N'GBD-TEST-01'), 1, N'Gebze Merkez', 40.802800, 29.430700),

    ((SELECT id FROM transport_routes WHERE route_code = N'GEB-MOR-01'), 1, N'Gebze Merkez', 40.802800, 29.430700),
    ((SELECT id FROM transport_routes WHERE route_code = N'GEB-MOR-01'), 2, N'Sabah Ekspres Durak', 40.839200, 29.397700),
    ((SELECT id FROM transport_routes WHERE route_code = N'GEB-MOR-01'), 3, N'Şekerpınar', 40.878900, 29.377600);
