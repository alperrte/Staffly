CREATE TABLE calendar_events (
                                 id BIGINT IDENTITY(1,1) PRIMARY KEY,

                                 title NVARCHAR(150) NOT NULL,
                                 description NVARCHAR(MAX) NULL,

                                 event_type NVARCHAR(40) NOT NULL,

                                 start_datetime DATETIME2 NOT NULL,
                                 end_datetime DATETIME2 NOT NULL,

                                 location NVARCHAR(200) NULL,
                                 online_meeting_url NVARCHAR(500) NULL,

                                 department_id BIGINT NULL,
                                 created_by BIGINT NULL,

                                 status NVARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

                                 created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                                 updated_at DATETIME2 NULL,

                                 CONSTRAINT CHK_event_type
                                     CHECK (event_type IN ('MEETING', 'TRAINING', 'INTERVIEW', 'COMPANY_EVENT', 'OTHER')),

                                 CONSTRAINT CHK_event_status
                                     CHECK (status IN ('ACTIVE', 'CANCELLED')),

                                 CONSTRAINT CHK_event_time
                                     CHECK (end_datetime > start_datetime)
);

CREATE INDEX IX_calendar_events_start_datetime
    ON calendar_events(start_datetime);

CREATE INDEX IX_calendar_events_department_id
    ON calendar_events(department_id);