CREATE TABLE support.tickets (
                                 id BIGINT IDENTITY PRIMARY KEY,

                                 title NVARCHAR(255) NOT NULL,
                                 description NVARCHAR(MAX) NOT NULL,

                                 employee_id BIGINT NOT NULL,

                                 category_id BIGINT,
                                 status_id BIGINT NOT NULL DEFAULT 1,

                                 priority NVARCHAR(50) DEFAULT 'MEDIUM',

                                 assigned_to BIGINT NULL,

                                 created_at DATETIME DEFAULT GETDATE(),
                                 updated_at DATETIME,
                                 resolved_at DATETIME,

                                 is_deleted BIT DEFAULT 0,

                                 CONSTRAINT fk_ticket_status
                                     FOREIGN KEY (status_id)
                                         REFERENCES support.ticket_status(id),

                                 CONSTRAINT fk_ticket_category
                                     FOREIGN KEY (category_id)
                                         REFERENCES support.ticket_categories(id)
);