CREATE TABLE support.ticket_categories (
                                           id BIGINT IDENTITY PRIMARY KEY,

                                           name NVARCHAR(100) NOT NULL,
                                           description NVARCHAR(255)
);