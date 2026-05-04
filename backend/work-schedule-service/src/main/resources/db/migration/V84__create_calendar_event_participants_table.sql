CREATE TABLE calendar_event_participants (
                                             id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                             event_id BIGINT NOT NULL,
                                             employee_id BIGINT NOT NULL,

                                             participant_status NVARCHAR(30) NOT NULL DEFAULT 'INVITED',

                                             created_at DATETIME2 NOT NULL DEFAULT GETDATE(),

                                             CONSTRAINT FK_event_participant_event
                                                 FOREIGN KEY (event_id)
                                                     REFERENCES calendar_events(id)
                                                     ON DELETE CASCADE,

                                             CONSTRAINT UQ_event_employee
                                                 UNIQUE (event_id, employee_id),

                                             CONSTRAINT CHK_participant_status
                                                 CHECK (participant_status IN ('INVITED', 'ACCEPTED', 'DECLINED'))
);

CREATE INDEX IX_event_participants_event_id
    ON calendar_event_participants(event_id);

CREATE INDEX IX_event_participants_employee_id
    ON calendar_event_participants(employee_id);