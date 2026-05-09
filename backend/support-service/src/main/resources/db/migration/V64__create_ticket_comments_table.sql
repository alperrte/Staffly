CREATE TABLE support.ticket_comments (
                                         id BIGINT IDENTITY PRIMARY KEY,

                                         ticket_id BIGINT NOT NULL,
                                         employee_id BIGINT NOT NULL,

                                         comment NVARCHAR(MAX) NOT NULL,

                                         created_at DATETIME DEFAULT GETDATE(),

                                         CONSTRAINT fk_comment_ticket
                                             FOREIGN KEY (ticket_id)
                                                 REFERENCES support.tickets(id)
);