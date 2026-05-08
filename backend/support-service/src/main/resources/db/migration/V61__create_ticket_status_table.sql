CREATE TABLE support.ticket_status (
                                       id BIGINT PRIMARY KEY,
                                       name NVARCHAR(50) UNIQUE NOT NULL
);